export default defineEventHandler((event) => {
  return generateBlogRssFeed(event, {
    feedPath: "/feed.atom",
    format: "atom",
  });
});
