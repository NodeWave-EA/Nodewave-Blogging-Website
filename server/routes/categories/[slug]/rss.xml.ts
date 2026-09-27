import { getRouterParam } from "h3";
import { generateBlogRssFeed } from "~~/server/utils/rss";

import type { BlogType } from "~/types";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Category slug parameter is required.",
    });
  }

  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");

  return generateBlogRssFeed(event, {
    feedPath: `/categories/${slug}/rss.xml`,
    titleSuffix: `Category: ${slug}`,
    description: `RSS feed for articles and development logs categorized under ${slug} on NodeWave.`,
    relatedFeeds: [
      { rel: "up", href: `${siteUrl}/categories/rss.xml`, title: "Categories Directory Feed" },
      { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ],
    filterFn: (post: BlogType) => {
      if (!post.categories || !Array.isArray(post.categories)) {
        return false;
      }

      return post.categories.some((cat) => {
        if (typeof cat === "string") {
          return cat === slug;
        }
        return cat?.slug === slug;
      });
    },
  });
});
