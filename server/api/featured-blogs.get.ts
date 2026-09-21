import type { H3Event } from "h3";
import type { BlogType } from "~/types";

export default defineEventHandler(async (event: H3Event) => {
  // Set CORS headers for cross-site access from the main website
  setResponseHeader(event, "Access-Control-Allow-Origin", "*");
  setResponseHeader(event, "Access-Control-Allow-Methods", "GET");

  // Read requested limit parameter (default: 4)
  const queryParams = getQuery(event);
  const limit = Number(queryParams.limit) || 4;

  // Fetch posts marked as featured
  let blogs = await queryCollection(event, "blogs")
    .where("published", "=", true)
    .where("draft", "=", false)
    .where("featured", "=", true)
    .order("date", "DESC")
    .limit(limit)
    .all() as BlogType[];

  // Full Fallback: If NO featured posts exist, fetch recent posts
  if (blogs.length === 0) {
    blogs = await queryCollection(event, "blogs")
      .where("published", "=", true)
      .where("draft", "=", false)
      .order("date", "DESC")
      .limit(limit)
      .all() as BlogType[];
  }
  // Partial Fallback: Top up with recent posts if fewer than limit exist
  else if (blogs.length < limit) {
    const existingSlugs = new Set(blogs.map(b => b.slug));
    const remainingCount = limit - blogs.length;

    const recentBlogs = await queryCollection(event, "blogs")
      .where("published", "=", true)
      .where("draft", "=", false)
      .order("date", "DESC")
      .limit(limit + existingSlugs.size)
      .all() as BlogType[];

    const fallbackBlogs = recentBlogs
      .filter(b => !existingSlugs.has(b.slug))
      .slice(0, remainingCount);

    blogs = [...blogs, ...fallbackBlogs];
  }

  // Enrich raw blog items
  const enrichedBlogs = await Promise.all(
    blogs.map(blog => enrichBlog(event, blog)),
  );

  // Pick ONLY essential fields required for card rendering
  return enrichedBlogs.map(blog => ({
    title: blog.title,
    description: blog.description,
    featured: blog.featured,
    slug: blog.slug,
    path: blog.path,
    date: blog.date,
    updatedAt: blog.updatedAt,
    coverImage: blog.coverImage,
    readingTime: blog.meta?.readingTime?.text ?? null,
    author: typeof blog.author === "object" && blog.author !== null
      ? {
          name: blog.author.name,
          title: blog.author.title,
          avatar: blog.author.avatar,
          slug: blog.author.slug,
        }
      : null,
    categories: Array.isArray(blog.categories)
      ? blog.categories.map(cat => ({
          name: typeof cat === "object" ? cat.name : cat,
          slug: typeof cat === "object" ? cat.slug : cat,
        }))
      : [],
    tags: Array.isArray(blog.tags)
      ? blog.tags.map(tag => ({
          name: typeof tag === "object" ? tag.name : tag,
          slug: typeof tag === "object" ? tag.slug : tag,
        }))
      : [],
  }));
});
