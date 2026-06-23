import type { H3Event } from "h3";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

/**
 * Enriches a blog entry by resolving its relational data (Author, Categories, Tags)
 * from their respective Nuxt Content collections using the backend runtime context.
 */
export async function enrichBlog(event: H3Event, blog: BlogType): Promise<BlogType> {
  if (!blog)
    return blog;

  // Resolve Author
  if (typeof blog.author === "string") {
    const authorData = await queryCollection(event, "authors")
      .where("slug", "=", blog.author)
      .first();

    if (authorData) {
      blog.author = authorData as unknown as BlogAuthor;
    }
  }

  // Resolve Categories
  if (Array.isArray(blog.categories) && blog.categories.length > 0) {
    const categoryPromises = blog.categories.map(async (slugOrObj: string | BlogCategory) => {
      if (typeof slugOrObj !== "string")
        return slugOrObj;

      const categoryData = await queryCollection(event, "categories")
        .where("slug", "=", slugOrObj)
        .first();

      return categoryData as unknown as BlogCategory;
    });

    const resolvedCategories = await Promise.all(categoryPromises);
    blog.categories = resolvedCategories.filter(Boolean);
  }

  // Resolve Tags
  if (Array.isArray(blog.tags) && blog.tags.length > 0) {
    const tagPromises = blog.tags.map(async (slugOrObj: string | BlogTag) => {
      if (typeof slugOrObj !== "string")
        return slugOrObj;

      const tagData = await queryCollection(event, "tags")
        .where("slug", "=", slugOrObj)
        .first();

      return tagData as unknown as BlogTag;
    });

    const resolvedTags = await Promise.all(tagPromises);
    blog.tags = resolvedTags.filter(Boolean);
  }

  return blog;
}

/**
 * Fetches all blogs from the collection, filters for published and non-draft entries,
 * orders them by date in descending order, and enriches each blog with additional data.
 */
export async function getAllBlogs(event: H3Event): Promise<BlogType[]> {
  const blogs = await queryCollection(event, "blogs")
    .where("published", "=", true)
    .where("draft", "=", false)
    .order("date", "DESC")
    .all() as BlogType[];

  // Map and enrich all blogs in parallel, passing along the event context
  const enrichedBlogs = await Promise.all(
    blogs.map(blog => enrichBlog(event, blog)),
  );

  return enrichedBlogs;
}
