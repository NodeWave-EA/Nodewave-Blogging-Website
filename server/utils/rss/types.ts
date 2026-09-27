export type FeedFormat = "rss" | "atom" | "json";

export type RelatedFeedLink = {
  rel: "self" | "related" | "up" | "alternate";
  href: string;
  title: string;
};
