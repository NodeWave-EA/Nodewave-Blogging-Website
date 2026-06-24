import type { ContentNavigationItem } from "@nuxt/content";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType, Searchable } from "~/types";

export function useContent() {
  /**
   * Fetches all blogs from the collection, filters for published and non-draft entries, orders them by date in descending order, and enriches each blog with additional data.
   *
   * @returns A promise that resolves to an array of enriched BlogType objects.
   */
  const getAllBlogs = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit ? `blog-all-${toValue(limit)}` : "blog-all-unlimited";

    return useAsyncData<BlogType[]>(cacheKey, async () => {
      let query = queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC");

      if (limit !== undefined) {
        query = query.limit(toValue(limit));
      }

      const blogs = await query.all() as BlogType[];

      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[];
    }, {
      watch: limit ? [() => toValue(limit)] : [],
    });
  };

  /**
   * Fetches a single blog by its path, ensuring it is published and not a draft, and enriches it with additional data.
   *
   * @param slug - The path of the blog to fetch, which can be a string, a ref, or a getter function.
   * @returns A promise that resolves to an enriched BlogType object.
   * @throws An error if the blog is not found for the given path.
   */
  const getBlogBySlug = async (slug: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogType>(`blog-${toValue(slug)}`, async () => {
      const blog = await queryCollection("blogs")
        .where("slug", "=", toValue(slug))
        .where("published", "=", true)
        .where("draft", "=", false)
        .first() as BlogType;

      if (!blog) {
        throw new Error(`Blog not found for slug: ${toValue(slug)}`);
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
   * Fetches the surrounding blogs for a given blog slug, ensuring they are published and not drafts.
   *
   * @param path - The path of the blog for which to fetch surrounding blogs.
   * @returns A promise that resolves to an array of surrounding BlogType objects.
   */
  const getSurroundingBlogs = async (path: MaybeRefOrGetter<string>) => {
    return useAsyncData<ContentNavigationItem[]>(`blog-surrounding-${toValue(path)}`, async () => {
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
  const getAllAuthors = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit ? `authors-all-${toValue(limit)}` : "authors-all-unlimited";

    return useAsyncData<Array<BlogAuthor & { count: number }>>(cacheKey, async () => {
      let query = queryCollection("authors").order("name", "ASC");

      if (limit !== undefined) {
        query = query.limit(toValue(limit));
      }

      const authors = await query.all() as BlogAuthor[];

      const enrichedAuthors = await Promise.all(
        authors.map(async (author) => {
          const associatedBlogs = await queryCollection("blogs")
            .where("author", "LIKE", `%${author.slug || author.id}%`)
            .where("published", "=", true)
            .where("draft", "=", false)
            .all();

          return {
            ...author,
            count: associatedBlogs.length,
          };
        }),
      );

      return enrichedAuthors;
    }, {
      watch: limit ? [() => toValue(limit)] : [],
    });
  };

  /**
   * Fetches a single author by their slug and returns it as a BlogAuthor object.
   *
   * @param slug - The slug of the author to fetch, which can be a string, a ref, or a getter function.
   * @returns A promise that resolves to a BlogAuthor object.
   */
  const getAuthorBySlug = async (slug: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogAuthor>(`author-${toValue(slug)}`, async () => {
      const author = await queryCollection("authors")
        .where("slug", "=", toValue(slug))
        .first() as BlogAuthor;

      if (!author) {
        throw new Error(`Author not found for slug: ${toValue(slug)}`);
      }

      return author as BlogAuthor;
    });
  };

  const getAuthorBlogs = (authorSlug: MaybeRefOrGetter<string>, limit?: MaybeRefOrGetter<number>) => {
    return useAsyncData<BlogType[]>(`author-blogs-${toValue(authorSlug)}-${limit ? toValue(limit) : "all"}`, async () => {
      let query = queryCollection("blogs")
        .where("author", "LIKE", `%${toValue(authorSlug)}%`)
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC");

      if (limit !== undefined) {
        query = query.limit(toValue(limit));
      }

      const blogs = await query.all() as BlogType[];
      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[];
    }, {
      watch: [() => toValue(authorSlug), ...(limit ? [() => toValue(limit)] : [])],
    });
  };

  /**
   * Fetches all categories with an optional pagination limit.
   * Efficiently computes and embeds associated blog post count metrics using native DB queries.
   */
  const getAllCategories = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit ? `category-all-${toValue(limit)}` : "category-all-unlimited";

    return useAsyncData<Array<BlogCategory & { count: number }>>(cacheKey, async () => {
      let query = queryCollection("categories").order("name", "ASC");

      if (limit !== undefined) {
        query = query.limit(toValue(limit));
      }

      const categories = await query.all() as BlogCategory[];

      const enrichedCategories = await Promise.all(
        categories.map(async (category) => {
          const associatedBlogs = await queryCollection("blogs")
            .where("categories", "LIKE", `%${category.slug}%`)
            .where("published", "=", true)
            .where("draft", "=", false)
            .all();

          return {
            ...category,
            count: associatedBlogs.length,
          };
        }),
      );

      return enrichedCategories;
    }, {
      watch: limit ? [() => toValue(limit)] : [],
    });
  };

  const getCategoryBySlug = async (slug: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogCategory>(`category-${toValue(slug)}`, async () => {
      const category = await queryCollection("categories")
        .where("slug", "=", toValue(slug))
        .first() as BlogCategory;

      if (!category) {
        throw new Error(`Category not found for slug: ${toValue(slug)}`);
      }

      return category as BlogCategory;
    });
  };

  const getCategoryBlogs = (slug: MaybeRefOrGetter<string>, limit?: MaybeRefOrGetter<number>) => {
    return useAsyncData<BlogType[]>(`category-blogs-${toValue(slug)}-${limit ? toValue(limit) : "all"}`, async () => {
      let query = queryCollection("blogs")
        .where("categories", "LIKE", `%${toValue(slug)}%`)
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC");

      if (limit !== undefined) {
        query = query.limit(toValue(limit));
      }

      const blogs = await query.all() as BlogType[];
      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[];
    }, {
      watch: [() => toValue(slug), ...(limit ? [() => toValue(limit)] : [])],
    });
  };

  /**
   * Fetches all tags with an optional reactive boundary limit.
   * Efficiently computes and aggregates associated blog post counters using SQL LIKE wildcards.
   */
  const getAllTags = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit ? `tags-all-${toValue(limit)}` : "tags-all-unlimited";

    return useAsyncData<Array<BlogTag & { count: number }>>(cacheKey, async () => {
      let query = queryCollection("tags").order("name", "ASC");

      if (limit !== undefined) {
        query = query.limit(toValue(limit));
      }

      const tags = await query.all() as BlogTag[];

      const enrichedTags = await Promise.all(
        tags.map(async (tag) => {
          const associatedBlogs = await queryCollection("blogs")
            .where("tags", "LIKE", `%${tag.slug}%`)
            .where("published", "=", true)
            .where("draft", "=", false)
            .all();

          return {
            ...tag,
            count: associatedBlogs.length,
          };
        }),
      );

      return enrichedTags;
    }, {
      watch: limit ? [() => toValue(limit)] : [],
    });
  };

  const getTagBySlug = async (slug: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogTag>(`tag-${toValue(slug)}`, async () => {
      const tag = await queryCollection("tags")
        .where("slug", "=", toValue(slug))
        .first() as BlogTag;

      if (!tag) {
        throw new Error(`Tag not found for slug: ${toValue(slug)}`);
      }

      return tag as BlogTag;
    });
  };

  const getTagBlogs = (tagSlug: MaybeRefOrGetter<string>, limit?: MaybeRefOrGetter<number>) => {
    return useAsyncData<BlogType[]>(`tag-blogs-${toValue(tagSlug)}-${limit ? toValue(limit) : "all"}`, async () => {
      let query = queryCollection("blogs")
        .where("tags", "LIKE", `%${toValue(tagSlug)}%`)
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC");

      if (limit !== undefined) {
        query = query.limit(toValue(limit));
      }

      const blogs = await query.all() as BlogType[];
      const enrichedBlogs = await Promise.all(blogs.map(enrichBlog));
      return enrichedBlogs as BlogType[];
    }, {
      watch: [() => toValue(tagSlug), ...(limit ? [() => toValue(limit)] : [])],
    });
  };

  /**
   * Fetches search sections for the "blogs" collection using the queryCollectionSearchSections function.
   *
   * @returns A promise that resolves to the search sections data for the "blogs" collection.
   */
  const getSearchSections = async () => {
    return useAsyncData<Searchable[]>("search-sections", async () => {
      const data = await queryCollectionSearchSections("blogs");
      return data;
    });
  };

  const getNavigation = async () => {
    return useAsyncData<ContentNavigationItem[]>("navigation", async () => {
      const navigation = await queryCollectionNavigation("blogs");
      return navigation;
    });
  };

  /**
   * Searches across all auxiliary metadata collections (Authors, Categories, Tags)
   *
   * @param searchString - The string to search for in the metadata collections.
   * @returns A promise that resolves to an object containing arrays of matching authors, categories, and tags.
   */
  const searchMetadataCollections = async (searchString: string) => {
    const query = searchString.trim().toLowerCase();
    if (!query)
      return { authors: [], categories: [], tags: [] };

    const [authors, categories, tags] = await Promise.all([
      queryCollection("authors").where("name", "LIKE", `%${query}%`).all(),
      queryCollection("categories").where("name", "LIKE", `%${query}%`).all(),
      queryCollection("tags").where("name", "LIKE", `%${query}%`).all(),
    ]);

    return { authors, categories, tags };
  };

  return {
    getAllBlogs,
    getBlogBySlug,
    getFeaturedBlogs,
    getSurroundingBlogs,
    getAllAuthors,
    getAuthorBySlug,
    getAuthorBlogs,
    getAllCategories,
    getCategoryBySlug,
    getCategoryBlogs,
    getAllTags,
    getTagBySlug,
    getTagBlogs,
    getSearchSections,
    getNavigation,
    searchMetadataCollections,
  };
}
