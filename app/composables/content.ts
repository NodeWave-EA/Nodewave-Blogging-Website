import type { ContentNavigationItem } from "@nuxt/content";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType, Searchable } from "~/types";

const { logger } = useLogger({ context: "useContent Composable" });

type EnrichedAuthor = BlogAuthor & { count: number };
type EnrichedCategory = BlogCategory & { count: number };
type EnrichedTag = BlogTag & { count: number };

type MetadataSearchIndex = {
  authors: EnrichedAuthor[];
  categories: EnrichedCategory[];
  tags: EnrichedTag[];
};

type LightweightBlogTaxonomy = {
  author?: unknown;
  category?: string;
  tags?: unknown;
};

// Module-level cached metadata index to prevent N+1 full-AST queries during search & directory loads
let cachedMetadataIndex: MetadataSearchIndex | null = null;
let metadataIndexPromise: Promise<MetadataSearchIndex> | null = null;

async function getOrBuildMetadataIndex(): Promise<MetadataSearchIndex> {
  if (cachedMetadataIndex) {
    return cachedMetadataIndex;
  }

  if (metadataIndexPromise) {
    return metadataIndexPromise;
  }

  metadataIndexPromise = (async () => {
    const [rawAuthors, rawCategories, rawTags, lightBlogs] = await Promise.all([
      await queryCollection("authors").order("name", "ASC").all() as unknown as Promise<BlogAuthor[]>,
      await queryCollection("categories").order("name", "ASC").all() as unknown as Promise<BlogCategory[]>,
      await queryCollection("tags").order("name", "ASC").all() as unknown as Promise<BlogTag[]>,
      await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .select("author", "category", "tags")
        .all() as unknown as Promise<LightweightBlogTaxonomy[]>,
    ]);

    // Pre-serialize author & tag fields once (O(B)) instead of running N+1 database queries
    const categoryCounts = new Map<string, number>();
    const serializedBlogTaxonomies = lightBlogs.map((blog) => {
      if (blog.category) {
        categoryCounts.set(blog.category, (categoryCounts.get(blog.category) || 0) + 1);
      }
      return {
        authorText: typeof blog.author === "string"
          ? blog.author
          : JSON.stringify(blog.author || ""),
        tagsText: typeof blog.tags === "string"
          ? blog.tags
          : JSON.stringify(blog.tags || ""),
      };
    });

    const authors: EnrichedAuthor[] = rawAuthors.map((author) => {
      let count = 0;
      for (const entry of serializedBlogTaxonomies) {
        if (author.slug && entry.authorText.includes(author.slug)) {
          count++;
        }
      }
      return { ...author, count };
    });

    const categories: EnrichedCategory[] = rawCategories.map(category => ({
      ...category,
      count: categoryCounts.get(category.slug) || 0,
    }));

    const tags: EnrichedTag[] = rawTags.map((tag) => {
      let count = 0;
      for (const entry of serializedBlogTaxonomies) {
        if (tag.slug && entry.tagsText.includes(tag.slug)) {
          count++;
        }
      }
      return { ...tag, count };
    });

    cachedMetadataIndex = { authors, categories, tags };
    return cachedMetadataIndex;
  })().finally(() => {
    metadataIndexPromise = null;
  });

  return metadataIndexPromise;
}

export function useContent() {
  /**
   * Fetches all blogs from the collection, filters for published and non-draft entries, orders them by date in descending order, and enriches each blog with additional data.
   */
  const getAllBlogs = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit
      ? `blog-all-${toValue(limit)}`
      : "blog-all-unlimited";

    return useAsyncData<BlogType[]>(
      cacheKey,
      async () => {
        let query = queryCollection("blogs")
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC");

        if (limit !== undefined) {
          query = query.limit(toValue(limit));
        }

        const blogs = await query.all() as BlogType[];

        return await Promise.all(
          blogs.map(blog => enrichBlog(blog)),
        );
      },
      {
        watch: limit
          ? [
              () => toValue(limit),
            ]
          : [],
      },
    );
  };

  /**
   * Fetches a single blog by its slug, ensuring it is published and not a draft, and enriches it with additional data.
   */
  const getBlogBySlug = (slug: MaybeRefOrGetter<string>) => {
    const cacheKey = `blog-detail-${toValue(slug)}`;

    return useAsyncData<BlogType>(
      cacheKey,
      async () => {
        const blog = await queryCollection("blogs")
          .where("slug", "LIKE", toValue(slug))
          .where("published", "=", true)
          .where("draft", "=", false)
          .first() as BlogType;

        if (!blog) {
          throw new Error(`Blog not found for slug: ${toValue(slug)}`);
        }

        return await enrichBlog(blog);
      },
      {
        watch: [
          () => toValue(slug),
        ],
      },
    );
  };

  /**
   * Fetches all featured blogs from the collection, filters for published and non-draft entries, orders them by date in descending order, and enriches each blog with additional data.
   */
  const getFeaturedBlogs = (limit: MaybeRefOrGetter<number> = 8) => {
    const cacheKey = `blog-featured-${toValue(limit)}`;

    return useAsyncData<BlogType[]>(
      cacheKey,
      async () => {
        const blogs = await queryCollection("blogs")
          .where("published", "=", true)
          .where("draft", "=", false)
          .where("featured", "=", true)
          .order("date", "DESC")
          .limit(toValue(limit))
          .all() as BlogType[];

        return await Promise.all(
          blogs.map(enrichBlog),
        );
      },
      {
        watch: [
          () => toValue(limit),
        ],
      },
    );
  };

  /**
   * Fetches the surrounding blogs for a given blog path, ensuring they are published and not drafts.
   */
  const getSurroundingBlogs = (path: MaybeRefOrGetter<string>) => {
    const cacheKey = `blog-surrounding-${toValue(path).split("/").filter(Boolean).pop()}`;

    return useAsyncData<ContentNavigationItem[]>(cacheKey, async () => {
      const surroundingBlogs = queryCollectionItemSurroundings("blogs", toValue(path), {
        fields: ["title", "description", "path", "stem"],
      });
      return surroundingBlogs as unknown as ContentNavigationItem[];
    }, {
      watch: [
        () => toValue(path),
      ],
    });
  };

  /**
   * Fetches all authors with associated blog counts using the single-pass metadata index.
   */
  const getAllAuthors = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit
      ? `authors-all-${toValue(limit)}`
      : "authors-all-unlimited";

    return useAsyncData<EnrichedAuthor[]>(
      cacheKey,
      async () => {
        const { authors } = await getOrBuildMetadataIndex();
        const max = limit !== undefined
          ? toValue(limit)
          : undefined;
        logger.log("Resolved authors data:", { count: authors.length });
        return max !== undefined
          ? authors.slice(0, max)
          : authors;
      },
      {
        watch: limit
          ? [
              () => toValue(limit),
            ]
          : [],
      },
    );
  };

  /**
   * Fetches a single author by their slug.
   */
  const getAuthorBySlug = (slug: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogAuthor>(
      `author-${toValue(slug)}`,
      async () => {
        const author = await queryCollection("authors")
          .where("slug", "LIKE", toValue(slug))
          .first() as BlogAuthor;

        if (!author) {
          throw new Error(`Author not found for slug: ${toValue(slug)}`);
        }

        return author;
      },
      {
        watch: [
          () => toValue(slug),
        ],
      },
    );
  };

  const getAuthorBlogs = (authorSlug: MaybeRefOrGetter<string>, limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = `author-blogs-${toValue(authorSlug)}-${limit
      ? toValue(limit)
      : "all"}`;

    return useAsyncData<BlogType[]>(
      cacheKey,
      async () => {
        let query = queryCollection("blogs")
          .where("author", "LIKE", `%${toValue(authorSlug)}%`)
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC");

        if (limit !== undefined) {
          query = query.limit(toValue(limit));
        }

        const blogs = await query.all() as BlogType[];

        return await Promise.all(
          blogs.map(enrichBlog),
        );
      },
      {
        watch: [
          () => toValue(authorSlug),
          ...(limit
            ? [
                () => toValue(limit),
              ]
            : []),
        ],
      },
    );
  };

  /**
   * Fetches all categories with associated blog counts using the single-pass metadata index.
   */
  const getAllCategories = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit
      ? `category-all-${toValue(limit)}`
      : "category-all-unlimited";

    return useAsyncData<EnrichedCategory[]>(
      cacheKey,
      async () => {
        const { categories } = await getOrBuildMetadataIndex();
        const max = limit !== undefined
          ? toValue(limit)
          : undefined;
        return max !== undefined
          ? categories.slice(0, max)
          : categories;
      },
      {
        watch: limit
          ? [
              () => toValue(limit),
            ]
          : [],
      },
    );
  };

  const getCategoryBySlug = (slug: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogCategory>(
      `category-${toValue(slug)}`,
      async () => {
        const category = await queryCollection("categories")
          .where("slug", "=", toValue(slug))
          .first() as BlogCategory;

        if (!category) {
          throw new Error(`Category not found for slug: ${toValue(slug)}`);
        }

        return category;
      },
      {
        watch: [
          () => toValue(slug),
        ],
      },
    );
  };

  const getCategoryBlogs = (slug: MaybeRefOrGetter<string>, limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = `category-blogs-${toValue(slug)}-${limit
      ? toValue(limit)
      : "all"}`;

    return useAsyncData<BlogType[]>(
      cacheKey,
      async () => {
        let query = queryCollection("blogs")
          .where("category", "=", toValue(slug))
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC");

        if (limit !== undefined) {
          query = query.limit(toValue(limit));
        }

        const blogs = await query.all() as BlogType[];

        return await Promise.all(
          blogs.map(enrichBlog),
        );
      },
      {
        watch: [
          () => toValue(slug),
          ...(limit
            ? [
                () => toValue(limit),
              ]
            : []),
        ],
      },
    );
  };

  /**
   * Fetches all tags with associated blog counts using the single-pass metadata index.
   */
  const getAllTags = (limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = limit
      ? `tags-all-${toValue(limit)}`
      : "tags-all-unlimited";

    return useAsyncData<EnrichedTag[]>(
      cacheKey,
      async () => {
        const { tags } = await getOrBuildMetadataIndex();
        const max = limit !== undefined
          ? toValue(limit)
          : undefined;
        return max !== undefined
          ? tags.slice(0, max)
          : tags;
      },
      {
        watch: limit
          ? [
              () => toValue(limit),
            ]
          : [],
      },
    );
  };

  const getTagBySlug = (slug: MaybeRefOrGetter<string>) => {
    return useAsyncData<BlogTag>(
      `tag-${toValue(slug)}`,
      async () => {
        const tag = await queryCollection("tags")
          .where("slug", "=", toValue(slug))
          .first() as BlogTag;

        if (!tag) {
          throw new Error(`Tag not found for slug: ${toValue(slug)}`);
        }

        return tag;
      },
      {
        watch: [
          () => toValue(slug),
        ],
      },
    );
  };

  const getTagBlogs = (tagSlug: MaybeRefOrGetter<string>, limit?: MaybeRefOrGetter<number>) => {
    const cacheKey = `tag-blogs-${toValue(tagSlug)}-${limit
      ? toValue(limit)
      : "all"}`;

    return useAsyncData<BlogType[]>(
      cacheKey,
      async () => {
        let query = queryCollection("blogs")
          .where("tags", "LIKE", `%${toValue(tagSlug)}%`)
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC");

        if (limit !== undefined) {
          query = query.limit(toValue(limit));
        }

        const blogs = await query.all() as BlogType[];

        return await Promise.all(
          blogs.map(enrichBlog),
        );
      },
      {
        watch: [
          () => toValue(tagSlug),
          ...(limit
            ? [
                () => toValue(limit),
              ]
            : []),
        ],
      },
    );
  };

  /**
   * Fetches search sections for the "blogs" collection using queryCollectionSearchSections.
   */
  const getSearchSections = () => {
    return useAsyncData<Searchable[]>("search-sections", async () => {
      return await queryCollectionSearchSections("blogs", {
        ignoredTags: ["code", "pre", "style", "script"],
      });
    });
  };

  const getNavigation = () => {
    return useAsyncData<ContentNavigationItem[]>("navigation", async () => {
      const navigation = queryCollectionNavigation("blogs");
      return navigation;
    });
  };

  /**
   * Searches across all auxiliary metadata collections (Authors, Categories, Tags)
   * using the cached in-memory index (< 0.1ms per keystroke, zero N+1 DB calls).
   */
  const searchMetadataCollections = async (searchString: string): Promise<MetadataSearchIndex> => {
    const query = searchString.trim().toLowerCase();
    if (!query) {
      return { authors: [], categories: [], tags: [] };
    }

    const index = await getOrBuildMetadataIndex();

    return {
      authors: index.authors.filter(a =>
        a.name?.toLowerCase().includes(query)
        || a.slug?.toLowerCase().includes(query)
        || a.title?.toLowerCase().includes(query)
        || a.description?.toLowerCase().includes(query),
      ),
      categories: index.categories.filter(c =>
        c.name?.toLowerCase().includes(query)
        || c.slug?.toLowerCase().includes(query)
        || c.description?.toLowerCase().includes(query),
      ),
      tags: index.tags.filter(t =>
        t.name?.toLowerCase().includes(query)
        || t.slug?.toLowerCase().includes(query)
        || t.description?.toLowerCase().includes(query),
      ),
    };
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
