import type { ContentNavigationItem } from "@nuxt/content";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

export function useContent() {
  /**
   * Fetches all blogs from the collection, filters for published and non-draft entries, orders them by date in descending order, and enriches each blog with additional data.
   *
   * @returns A promise that resolves to an array of enriched BlogType objects.
   */
  const getAllBlogs = () => {
    // Explicitly type useAsyncData with the expected final structure
    return useAsyncData<BlogType[]>("blog-all", async () => {
      // Fetch only published, non-draft records
      const blogs = await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all() as BlogType[]; // Cast to BlogType[] for type safety

      // Map and enrich all blogs in parallel
      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[]; // Ensure the return type is BlogType[]
    });
  };

  /**
   * Fetches a single blog by its path, ensuring it is published and not a draft, and enriches it with additional data.
   *
   * @param path - The path of the blog to fetch, which can be a string, a ref, or a getter function.
   * @returns A promise that resolves to an enriched BlogType object.
   * @throws An error if the blog is not found for the given path.
   */
  const getBlogByPath = async (path: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogType>(`blog-${path}`, async () => {
      const blog = await queryCollection("blogs")
        .where("path", "=", unref(path))
        .where("published", "=", true)
        .where("draft", "=", false)
        .first() as BlogType; // Cast to BlogType for type safety

      if (!blog) {
        throw new Error(`Blog not found for path: ${unref(path)}`);
      }

      const enrichedBlog = await enrichBlog(blog);
      return enrichedBlog as BlogType; // Ensure the return type is BlogType
    });
  };

  /**
   * Fetches all featured blogs from the collection, filters for published and non-draft entries, orders them by date in descending order, and enriches each blog with additional data.
   *
   * @param limit - The maximum number of featured blogs to fetch, which can be a number, a ref, or a getter function. Defaults to 5.
   * @returns A promise that resolves to an array of enriched BlogType objects that are marked as featured.
   */
  const getFeaturedBlogs = async (limit: MaybeRefOrGetter<number> = 5) => {
    return useAsyncData<BlogType[]>("blog-featured", async () => {
      const blogs = await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .where("featured", "=", true)
        .order("date", "DESC")
        .limit(toValue(limit))
        .all() as BlogType[]; // Cast to BlogType[] for type safety

      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[]; // Ensure the return type is BlogType[]
    });
  };

  /**
   * Fetches the surrounding blogs for a given blog path, ensuring they are published and not drafts.
   *
   * @param path - The path of the blog for which to fetch surrounding blogs.
   * @returns A promise that resolves to an array of surrounding BlogType objects.
   */
  const getSurroundingBlogs = async (path: MaybeRefOrGetter<string>) => {
    return useAsyncData<ContentNavigationItem[]>(`blog-surrounding-${path}`, async () => {
      const surroundingBlogs = await queryCollectionItemSurroundings("blogs", toValue(path), {
        fields: ["title", "description", "path", "stem"],
      });
      return surroundingBlogs as ContentNavigationItem[];
    });
  };

  /**
   * Fetches all authors from the collection and returns them as an array of BlogAuthor objects.
   *
   * @returns A promise that resolves to an array of BlogAuthor objects.
   */
  const getAllAuthors = async () => {
    return useAsyncData<BlogAuthor[]>("authors-all", async () => {
      const authors = await queryCollection("authors").all() as BlogAuthor[]; // Cast to BlogAuthor[] for type safety
      return authors as BlogAuthor[]; // Ensure the return type is BlogAuthor[]
    });
  };

  /**
   * Fetches a single author by their path and returns it as a BlogAuthor object.
   *
   * @param path - The path of the author to fetch, which can be a string, a ref, or a getter function.
   * @returns A promise that resolves to a BlogAuthor object.
   */
  const getAuthorByPath = async (path: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogAuthor>(`author-${path}`, async () => {
      const author = await queryCollection("authors")
        .where("path", "=", unref(path))
        .first() as BlogAuthor; // Cast to BlogAuthor for type safety

      if (!author) {
        throw new Error(`Author not found for path: ${unref(path)}`);
      }

      return author as BlogAuthor; // Ensure the return type is BlogAuthor
    });
  };

  /**
   * Fetches all blogs authored by a specific author, ensuring they are published and not drafts, and enriches each blog with additional data.
   *
   * @param authorPath - The path of the author whose blogs to fetch, which can be a string, a ref, or a getter function.
   * @returns A promise that resolves to an array of enriched BlogType objects authored by the specified author.
   */
  const getAuthorBlogs = async (authorPath: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogType[]>(`author-blogs-${authorPath}`, async () => {
      const blogs = await queryCollection("blogs")
        .where("author.path", "=", unref(authorPath))
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all() as BlogType[]; // Cast to BlogType[] for type safety

      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[]; // Ensure the return type is BlogType[]
    });
  };

  const getAllCategories = async () => {
    return useAsyncData<BlogCategory[]>("categories-all", async () => {
      const categories = await queryCollection("categories")
        .all() as BlogCategory[]; // Cast to BlogCategory[] for type safety

      return categories as BlogCategory[]; // Ensure the return type is BlogCategory[]
    });
  };

  const getCategoryByPath = async (path: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogCategory>(`category-${path}`, async () => {
      const category = await queryCollection("categories")
        .where("path", "=", unref(path))
        .first() as BlogCategory; // Cast to BlogCategory for type safety

      if (!category) {
        throw new Error(`Category not found for path: ${unref(path)}`);
      }

      return category as BlogCategory; // Ensure the return type is BlogCategory
    });
  };

  const getCategoryBlogs = async (categoryPath: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogType[]>(`category-blogs-${categoryPath}`, async () => {
      const blogs = await queryCollection("blogs")
        .where("category.path", "=", unref(categoryPath))
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all() as BlogType[]; // Cast to BlogType[] for type safety

      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[]; // Ensure the return type is BlogType[]
    });
  };

  const getAllTags = async () => {
    return useAsyncData<BlogTag[]>("tags-all", async () => {
      const tags = await queryCollection("tags")
        .all() as BlogTag[]; // Cast to BlogTag[] for type safety

      return tags as BlogTag[]; // Ensure the return type is BlogTag[]
    });
  };

  const getTagByPath = async (path: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogTag>(`tag-${path}`, async () => {
      const tag = await queryCollection("tags")
        .where("path", "=", unref(path))
        .first() as BlogTag; // Cast to BlogTag for type safety

      if (!tag) {
        throw new Error(`Tag not found for path: ${unref(path)}`);
      }

      return tag as BlogTag; // Ensure the return type is BlogTag
    });
  };

  const getTagBlogs = async (tagPath: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogType[]>(`tag-blogs-${tagPath}`, async () => {
      const blogs = await queryCollection("blogs")
        .where("tags.path", "=", unref(tagPath))
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all() as BlogType[]; // Cast to BlogType[] for type safety

      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[]; // Ensure the return type is BlogType[]
    });
  };

  return {
    getAllBlogs,
    getBlogByPath,
    getFeaturedBlogs,
    getSurroundingBlogs,
    getAllAuthors,
    getAuthorByPath,
    getAuthorBlogs,
    getAllCategories,
    getCategoryByPath,
    getCategoryBlogs,
    getAllTags,
    getTagByPath,
    getTagBlogs,
  };
}
