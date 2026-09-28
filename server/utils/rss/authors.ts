import { Feed } from "feed";
import { setResponseStatus } from "h3";
import { getAllAuthors, getAllBlogs } from "~~/server/utils/content";

import { generateBlogRssFeed } from "./blogs";
import {
  cleanRssHtml,
  escapeXml,
  formatDate,
  getLatestBlogDate,
  isCacheFresh,
  renderFeedResponse,
  sortBlogsByDateDesc,
} from "./shared";

import type { FeedFormat } from "./types";
import type { H3Event } from "h3";

/**
 * Generates individual Author Feed (/authors/:slug/rss.xml).
 */
export async function generateAuthorRssFeed(
  event: H3Event,
  authorSlug: string,
  format: FeedFormat = "rss",
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl).replace(/\/$/, "");

  return generateBlogRssFeed(event, {
    feedPath: `/authors/${authorSlug}/rss.xml`,
    titleSuffix: `Articles by ${authorSlug}`,
    description: `RSS feed for articles and insights authored by ${authorSlug} on NodeWave.`,
    format,
    relatedFeeds: [
      { rel: "up", href: `${siteUrl}/authors/rss.xml`, title: "Authors Roster Feed" },
      { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ],
    filterFn: (post) => {
      if (typeof post.author === "object" && post.author?.slug) {
        return post.author.slug === authorSlug;
      }
      if (typeof post.author === "string") {
        return post.author === authorSlug;
      }
      return false;
    },
  });
}

/**
 * Generates Authors Feed Index (/authors/rss.xml).
 */
export async function generateAuthorsRssFeed(event: H3Event, format: FeedFormat = "rss"): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl).replace(/\/$/, "");
  const feedUrl = `${siteUrl}/authors/rss.xml`;

  const authors = await getAllAuthors(event);
  const allBlogs = sortBlogsByDateDesc(await getAllBlogs(event));

  const latestDate = getLatestBlogDate(allBlogs);
  if (isCacheFresh(event, latestDate)) {
    setResponseStatus(event, 304);
    return "";
  }

  const feed = new Feed({
    title: "NodeWave — Editorial Roster & Authors Index",
    description: "Index of core contributors, technical architects, and their published articles.",
    id: feedUrl,
    link: `${siteUrl}/authors`,
    language: "en",
    generator: "Nodewave RSS Engine",
    feedLinks: { rss2: feedUrl },
  });

  for (const author of authors) {
    const authorUrl = `${siteUrl}/authors/${author.slug}`;
    const authorBlogs = allBlogs.filter((blog) => {
      if (typeof blog.author === "object" && blog.author?.slug) {
        return blog.author.slug === author.slug;
      }
      if (typeof blog.author === "string") {
        return blog.author === author.slug;
      }
      return false;
    });

    const count = authorBlogs.length;
    const countLabel = `${count} ${count === 1 ? "article" : "articles"}`;
    const title = `${author.name || author.slug} (${countLabel})`;

    let html = `<p>${escapeXml(author.description || `Core technical contributor at NodeWave (${countLabel}).`)}</p>`;
    if (count > 0) {
      html += `<h3>Published Articles (${count}):</h3><ul>`;
      for (const b of authorBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        const dateFormatted = b.date ? ` — <em>${formatDate(b.date)}</em>` : "";
        html += `<li><a href="${siteUrl}${bPath}">${escapeXml(b.title || "Untitled")}</a>${dateFormatted}</li>`;
      }
      html += `</ul>`;
    }

    const description = author.description
      ? `${author.description} (${countLabel})`
      : `Author profile for ${author.name || author.slug}. Total published: ${countLabel}.`;

    feed.addItem({
      title,
      id: authorUrl,
      link: authorUrl,
      description,
      content: cleanRssHtml(html),
      date: getLatestBlogDate(authorBlogs),
    });
  }

  return renderFeedResponse(
    event,
    feed,
    latestDate,
    feedUrl,
    format,
    [{ rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" }],
    siteUrl,
  );
}
