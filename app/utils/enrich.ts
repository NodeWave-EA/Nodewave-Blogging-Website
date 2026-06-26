import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

export async function enrichBlog(blog: BlogType): Promise<BlogType> {
  if (!blog)
    return blog;

  // Resolve Author
  // Checking if author exists and is a string (slug) before querying
  if (typeof blog.author === "string") {
    const authorData = await queryCollection("authors")
      .where("slug", "=", blog.author)
      .first();

    if (authorData) {
      blog.author = authorData as unknown as BlogAuthor;
    }
  }

  // Resolve Categories
  if (Array.isArray(blog.categories) && blog.categories.length > 0) {
    // Map existing slugs to query promises
    const categories = await Promise.all(blog.categories.map(async (slugOrObj: string | BlogCategory) => {
      // Guard case if it's already resolved somehow
      if (typeof slugOrObj !== "string")
        return slugOrObj;
      const categoryData = await queryCollection("categories")
        .where("slug", "=", slugOrObj)
        .first();
      return categoryData as unknown as BlogCategory;
    }));

    blog.categories = categories.filter(Boolean);
  }

  // Resolve Tags
  if (Array.isArray(blog.tags) && blog.tags.length > 0) {
    const tags = await Promise.all(blog.tags.map(async (slugOrObj: string | BlogTag) => {
      if (typeof slugOrObj !== "string")
        return slugOrObj;
      const tagData = await queryCollection("tags")
        .where("slug", "=", slugOrObj)
        .first();

      return tagData as unknown as BlogTag;
    }));

    blog.tags = tags.filter(Boolean);
  }

  return blog;
}
