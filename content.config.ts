import { defineCollection, defineContentConfig } from "@nuxt/content";

import { authorSchema, blogSchema, categorySchema, tagSchema } from "./app/types";

export default defineContentConfig({
  collections: {
    blogs: defineCollection({
      type: "page",
      source: "blogs/**/*.md",
      schema: blogSchema,
      indexes: [
        { columns: ["date"] },
        { columns: ["draft"] },
        { columns: ["published"] },
        { columns: ["featured"] },
        { columns: ["published", "date"] },
        { columns: ["draft", "featured"] },
      ],
    }),
    authors: defineCollection({
      type: "data",
      source: "authors/**/*.yml",
      schema: authorSchema,
      indexes: [
        { columns: ["name"] },
        { columns: ["slug"] },
        { columns: ["name", "slug"] },
      ],
    }),
    tags: defineCollection({
      type: "data",
      source: "tags/**/*.yml",
      schema: tagSchema,
      indexes: [
        { columns: ["name"] },
        { columns: ["slug"] },
        { columns: ["name", "slug"] },
      ],
    }),
    categories: defineCollection({
      type: "data",
      source: "categories/**/*.yml",
      schema: categorySchema,
      indexes: [
        { columns: ["name"] },
        { columns: ["slug"] },
        { columns: ["name", "slug"] },
      ],
    }),
  },
});
