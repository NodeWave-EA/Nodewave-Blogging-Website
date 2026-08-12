import { generateBlogRssFeed } from "~~/server/utils/rss";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");

  return generateBlogRssFeed(event, {
    feedPath: "/rss.xml",
    titleSuffix: "All Technical Articles",
    description: "Master feed containing all technical articles, architecture notes, and development logs.",
    relatedFeeds: [
      { rel: "related", href: `${siteUrl}/blogs/rss.xml`, title: "Blog Archive Feed" },
      { rel: "related", href: `${siteUrl}/authors/rss.xml`, title: "Authors & Editorial Feed" },
      { rel: "related", href: `${siteUrl}/categories/rss.xml`, title: "Categories Feed" },
      { rel: "related", href: `${siteUrl}/tags/rss.xml`, title: "Tags Feed" },
    ],
  });
});
