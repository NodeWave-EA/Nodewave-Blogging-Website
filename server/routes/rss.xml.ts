import { generateRssFeed } from "~~/server/utils/rss";

export default defineEventHandler((event) => {
  return generateRssFeed(event, {
    feedPath: "/rss.xml",
    titleSuffix: "All Technical Articles",
  });
});
