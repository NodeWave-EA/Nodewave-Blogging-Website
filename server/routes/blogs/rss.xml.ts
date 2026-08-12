import { generateRssFeed } from "~~/server/utils/rss";

export default defineEventHandler((event) => {
  return generateRssFeed(event, {
    feedPath: "/blogs/rss.xml",
    titleSuffix: "Blog Archive",
    description: "Complete feed of technical articles, architecture notes, and development logs.",
  });
});
