import type { H3Event } from "h3";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

/**
 * Normalizes any string, file path, or ID into a clean, lowercased slug.
 * e.g., "categories/categories/iot.yml" -> "iot"
 */
export function normalizeSlug(input?: string): string {
  if (!input || typeof input !== "string")
    return "";
  return input
    .trim()
    .split("/")
    .pop()!
    .replace(/\.(yml|yaml|json|md)$/i, "")
    .toLowerCase();
}

/**
 * Checks if a blog category reference matches a target category slug or string.
 */
export function matchesCategory(
  categoryItem: string | BlogCategory | undefined | null,
  targetSlug: string,
): boolean {
  if (!categoryItem || !targetSlug)
    return false;

  const normalizedTarget = normalizeSlug(targetSlug);

  if (typeof categoryItem === "string") {
    return normalizeSlug(categoryItem) === normalizedTarget;
  }

  if (typeof categoryItem === "object") {
    const itemSlug = normalizeSlug(categoryItem.slug || categoryItem.id || categoryItem.stem);
    if (itemSlug && itemSlug === normalizedTarget)
      return true;
    if (categoryItem.name && categoryItem.name.toLowerCase() === targetSlug.toLowerCase())
      return true;
  }

  return false;
}

/**
 * Checks if a blog tag reference matches a target tag slug or string.
 */
export function matchesTag(
  tagItem: string | BlogTag | undefined | null,
  targetSlug: string,
): boolean {
  if (!tagItem || !targetSlug)
    return false;

  const normalizedTarget = normalizeSlug(targetSlug);

  if (typeof tagItem === "string") {
    return normalizeSlug(tagItem) === normalizedTarget;
  }

  if (typeof tagItem === "object") {
    const itemSlug = normalizeSlug(tagItem.slug || tagItem.id || tagItem.stem);
    if (itemSlug && itemSlug === normalizedTarget)
      return true;
    if (tagItem.name && tagItem.name.toLowerCase() === targetSlug.toLowerCase())
      return true;
  }

  return false;
}

/**
 * Enriches a blog entry by resolving its relational data (Author, Categories, Tags)
 * from their respective Nuxt Content collections using the backend runtime context.
 */
export async function enrichBlog(event: H3Event, blog: BlogType): Promise<BlogType> {
  if (!blog)
    return blog;

  // Fetch all reference metadata collections once for fast in-memory matching
  const [allAuthors, allCategories, allTags] = await Promise.all([
    getAllAuthors(event).catch(() => [] as BlogAuthor[]),
    getAllCategories(event).catch(() => [] as BlogCategory[]),
    getAllTags(event).catch(() => [] as BlogTag[]),
  ]);

  // Resolve Author
  if (blog.author) {
    if (typeof blog.author === "string") {
      const authorSlug = normalizeSlug(blog.author);
      const matchedAuthor = allAuthors.find(
        a => normalizeSlug(a.slug) === authorSlug || normalizeSlug(a.id) === authorSlug || normalizeSlug(a.stem) === authorSlug,
      );

      if (matchedAuthor) {
        blog.author = matchedAuthor;
      }
    }
    else if (typeof blog.author === "object" && blog.author.slug) {
      const authorSlug = normalizeSlug(blog.author.slug);
      const matchedAuthor = allAuthors.find(a => normalizeSlug(a.slug) === authorSlug);
      if (matchedAuthor) {
        blog.author = { ...matchedAuthor, ...blog.author };
      }
    }
  }

  // Resolve Categories (handles string paths, arrays of strings, or arrays of objects)
  let rawCategories = blog.categories || (blog as any).category;
  if (rawCategories) {
    if (!Array.isArray(rawCategories)) {
      rawCategories = [rawCategories];
    }

    blog.categories = rawCategories
      .map((item: string | BlogCategory) => {
        if (!item)
          return null;

        if (typeof item === "object") {
          const itemSlug = normalizeSlug(item.slug || item.id || item.stem);
          const matched = allCategories.find(c => normalizeSlug(c.slug) === itemSlug);
          return matched ? { ...matched, ...item } : item;
        }

        if (typeof item === "string") {
          const itemSlug = normalizeSlug(item);
          const matched = allCategories.find(
            c => normalizeSlug(c.slug) === itemSlug || normalizeSlug(c.id) === itemSlug || normalizeSlug(c.stem) === itemSlug,
          );

          if (matched)
            return matched;

          // Fallback category object if record is unindexed or missing in database
          const formattedName = itemSlug
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());

          return {
            id: `categories/${itemSlug}.yml`,
            name: formattedName || item,
            slug: itemSlug,
            description: `Articles categorized under ${formattedName || item}`,
            icon: "i-heroicons-folder",
            color: "#64748b",
            featured: false,
            extension: "yml",
            stem: `categories/${itemSlug}`,
            meta: {},
          } as BlogCategory;
        }

        return null;
      })
      .filter(Boolean) as BlogCategory[];
  }
  else {
    blog.categories = [];
  }

  // 4. Resolve Tags (handles string paths, arrays of strings, or arrays of objects)
  let rawTags = blog.tags || (blog as any).tag;
  if (rawTags) {
    if (!Array.isArray(rawTags)) {
      rawTags = [rawTags];
    }

    blog.tags = rawTags
      .map((item: string | BlogTag) => {
        if (!item)
          return null;

        if (typeof item === "object") {
          const itemSlug = normalizeSlug(item.slug || item.id || item.stem);
          const matched = allTags.find(t => normalizeSlug(t.slug) === itemSlug);
          return matched ? { ...matched, ...item } : item;
        }

        if (typeof item === "string") {
          const itemSlug = normalizeSlug(item);
          const matched = allTags.find(
            t => normalizeSlug(t.slug) === itemSlug || normalizeSlug(t.id) === itemSlug || normalizeSlug(t.stem) === itemSlug,
          );

          if (matched)
            return matched;

          // Fallback tag object
          const formattedName = itemSlug
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());

          return {
            id: `tags/${itemSlug}.yml`,
            name: formattedName || item,
            slug: itemSlug,
            description: `Articles tagged with #${formattedName || item}`,
            icon: "i-heroicons-tag",
            color: "#64748b",
            extension: "yml",
            stem: `tags/${itemSlug}`,
            meta: {},
          } as BlogTag;
        }

        return null;
      })
      .filter(Boolean) as BlogTag[];
  }
  else {
    blog.tags = [];
  }

  return blog;
}

/**
 * Fetches all blogs from the collection, filters for published and non-draft entries,
 * orders them by date in descending order, and enriches each blog with additional data.
 */
export async function getAllBlogs(event: H3Event): Promise<BlogType[]> {
  const blogs = (await queryCollection(event, "blogs")
    .where("published", "=", true)
    .where("draft", "=", false)
    .order("date", "DESC")
    .all()) as BlogType[];

  // Map and enrich all blogs in parallel
  return Promise.all(blogs.map(blog => enrichBlog(event, blog)));
}

/**
 * Fetches all indexed authors.
 */
export async function getAllAuthors(event: H3Event): Promise<BlogAuthor[]> {
  return (await queryCollection(event, "authors").all()) as BlogAuthor[];
}

/**
 * Fetches all indexed categories.
 */
export async function getAllCategories(event: H3Event): Promise<BlogCategory[]> {
  return (await queryCollection(event, "categories").all()) as BlogCategory[];
}

/**
 * Fetches all indexed tags.
 */
export async function getAllTags(event: H3Event): Promise<BlogTag[]> {
  return (await queryCollection(event, "tags").all()) as BlogTag[];
}
