import { createError, getRouterParam } from "h3";
import { generateBlogRssFeed } from "~~/server/utils/rss";

import type { BlogType } from "~/types";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tag slug parameter is required.",
    });
  }

  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");

  return generateBlogRssFeed(event, {
    feedPath: `/tags/${slug}/rss.xml`,
    titleSuffix: `Tag: #${slug}`,
    description: `RSS feed for articles and development logs tagged under #${slug} on NodeWave.`,
    relatedFeeds: [
      { rel: "up", href: `${siteUrl}/tags/rss.xml`, title: "Tags Directory Feed" },
      { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ],
    filterFn: (post: BlogType) => {
      if (!post.tags || !Array.isArray(post.tags)) {
        return false;
      }

      return post.tags.some((tag) => {
        if (typeof tag === "string") {
          return tag === slug;
        }
        return tag?.slug === slug;
      });
    },
  });
});
