import { renderHtml } from "@comark/html";
import { Feed } from "feed";
import { setResponseStatus } from "h3";
import { getAllBlogs } from "~~/server/utils/content";

import {
  cleanRssHtml,
  getLatestBlogDate,
  isCacheFresh,
  renderFeedResponse,
  renderMiniMarkToHtml,
  sortBlogsByDateDesc,
} from "./shared";

import type { FeedFormat, RelatedFeedLink } from "./types";
import type { H3Event } from "h3";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

/**
 * Builds standard blog post RSS feed or custom filtered feeds.
 */
export async function generateBlogRssFeed(
  event: H3Event,
  options: {
    feedPath: string;
    titleSuffix?: string;
    description?: string;
    format?: FeedFormat;
    relatedFeeds?: RelatedFeedLink[];
    filterFn?: (post: BlogType) => boolean;
  },
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl).replace(/\/$/, "");
  const feedUrl = `${siteUrl}${options.feedPath}`;

  let posts = await getAllBlogs(event);
  if (options.filterFn) {
    posts = posts.filter(options.filterFn);
  }

  posts = sortBlogsByDateDesc(posts);

  const latestDate = getLatestBlogDate(posts);
  if (isCacheFresh(event, latestDate)) {
    setResponseStatus(event, 304);
    return "";
  }

  const feed = new Feed({
    title: options.titleSuffix ? `NodeWave — ${options.titleSuffix}` : "NodeWave — All Technical Articles",
    description: options.description || "Master feed containing all technical articles, architecture notes, and development logs.",
    id: feedUrl,
    link: `${siteUrl}/`,
    language: "en",
    favicon: `${siteUrl}/favicon.ico`,
    image: `${siteUrl}/logo.png`,
    copyright: `Copyright © ${new Date().getFullYear()} NodeWave. All rights reserved.`,
    generator: "Nodewave RSS Engine",
    feedLinks: {
      rss2: feedUrl,
      atom: `${feedUrl}.atom`,
      json: `${feedUrl}.json`,
    },
  });

  for (const post of posts) {
    const postPath = post.path.startsWith("/") ? post.path : `/${post.path}`;
    const postUrl = `${siteUrl}${postPath}`;

    const authorObj = typeof post.author === "object" ? (post.author as BlogAuthor) : null;
    const authorName = authorObj?.name || (typeof post.author === "string" ? post.author : "NodeWave Team");
    const authorEmail = authorObj?.email || "info@nodewave.net";

    const categories = Array.isArray(post.categories) ? (post.categories as BlogCategory[]) : [];
    const tags = Array.isArray(post.tags) ? (post.tags as BlogTag[]) : [];

    let bodyHtml = post.description || "";
    if (post.body) {
      try {
        let rawHtml = "";

        if (typeof post.body === "string") {
          rawHtml = await renderHtml(post.body);
        }
        else if (post.body && typeof post.body === "object") {
          if (post.body.type === "minimark" && Array.isArray(post.body.value)) {
            rawHtml = renderMiniMarkToHtml(post.body.value);
          }
          else if (Array.isArray(post.body.value)) {
            rawHtml = renderMiniMarkToHtml(post.body.value);
          }
          else if (Array.isArray(post.body)) {
            rawHtml = renderMiniMarkToHtml(post.body);
          }
          else {
            rawHtml = await renderHtml(post.body as any);
          }
        }

        if (rawHtml) {
          rawHtml = rawHtml.replace(/className=/g, "class=");
          rawHtml = rawHtml.replace(/\s*(code|language|meta)="[\s\S]*?"/g, "");
          rawHtml = rawHtml.replace(/href="#([^"]+)"/g, `href="${postUrl}#$1"`);
          rawHtml = rawHtml.replace(/href="\/([^"]+)"/g, `href="${siteUrl}/$1"`);
          rawHtml = rawHtml.replace(/src="\/([^"]+)"/g, `src="${siteUrl}/$1"`);

          bodyHtml = cleanRssHtml(rawHtml);
        }
      }
      catch (e) {
        console.warn(`[RSS Builder] Error rendering HTML for ${post.title}`, e);
      }
    }

    const xmlCategories = [
      ...categories.map(c => ({ name: c.name, domain: `${siteUrl}/categories/${c.slug}` })),
      ...tags.map(t => ({ name: t.name, domain: `${siteUrl}/tags/${t.slug}` })),
    ];

    const coverImage = post.coverImage?.src;
    const imageUrl = coverImage
      ? coverImage.startsWith("http")
        ? coverImage
        : `${siteUrl}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`
      : undefined;

    feed.addItem({
      title: post.title || "Untitled Article",
      id: postUrl,
      link: postUrl,
      description: post.description || "",
      content: bodyHtml,
      date: post.date ? new Date(post.date) : new Date(),
      category: xmlCategories,
      image: imageUrl,
      author: [{ name: authorName, email: authorEmail }],
    });
  }

  return renderFeedResponse(event, feed, latestDate, feedUrl, options.format || "rss", options.relatedFeeds, siteUrl);
}
