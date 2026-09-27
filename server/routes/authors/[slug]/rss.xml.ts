import { getRouterParam } from "h3";
import { generateBlogRssFeed } from "~~/server/utils/rss";

import type { BlogType } from "~/types";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");

  return generateBlogRssFeed(event, {
    feedPath: `/authors/${slug}/rss.xml`,
    titleSuffix: `Articles by ${slug}`,
    description: `RSS feed for articles and insights authored by ${slug} on NodeWave.`,
    relatedFeeds: [
      { rel: "up", href: `${siteUrl}/authors/rss.xml`, title: "Authors Roster Feed" },
      { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ],
    filterFn: (post: BlogType) => {
      if (typeof post.author === "object" && post.author !== null) {
        return post.author.slug === slug;
      }
      return post.author === slug;
    },
  });
});
