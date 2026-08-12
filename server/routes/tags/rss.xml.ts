import { generateTagsRssFeed } from "~~/server/utils/rss";

export default defineEventHandler((event) => {
  return generateTagsRssFeed(event);
});
