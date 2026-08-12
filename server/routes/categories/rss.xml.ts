import { generateCategoriesRssFeed } from "~~/server/utils/rss";

export default defineEventHandler((event) => {
  return generateCategoriesRssFeed(event);
});

