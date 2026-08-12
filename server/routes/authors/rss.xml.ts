import { generateAuthorsRssFeed } from "~~/server/utils/rss";

export default defineEventHandler((event) => {
  return generateAuthorsRssFeed(event);
});
