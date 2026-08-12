import { generateBlogRssFeed } from "~~/server/utils/rss";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");

  return generateBlogRssFeed(event, {
    feedPath: "/blogs/rss.xml",
    titleSuffix: "Blog Archive",
    description: "Complete feed of technical articles and logs.",
    relatedFeeds: [
      { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ],
  });
});
