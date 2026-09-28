import { Feed } from "feed";
import { setResponseStatus } from "h3";
import { getAllBlogs, getAllTags, matchesTag } from "~~/server/utils/content";

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

import type { FeedFormat, RelatedFeedLink } from "./types";
import type { H3Event } from "h3";

/**
 * Generates individual Tag Feed (/tags/:slug/rss.xml).
 */
export async function generateTagRssFeed(
  event: H3Event,
  tagSlug: string,
  format: FeedFormat = "rss",
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl).replace(/\/$/, "");

  const tags = await getAllTags(event);
  const tag = tags.find(t => t.slug === tagSlug);
  const tagName = tag?.name || tagSlug;

  return generateBlogRssFeed(event, {
    feedPath: `/tags/${tagSlug}/rss.xml`,
    titleSuffix: `Tag: #${tagName}`,
    description: tag?.description || `Technical articles, guides, and engineering notes tagged with #${tagName} on NodeWave.`,
    format,
    relatedFeeds: [
      { rel: "up", href: `${siteUrl}/tags/rss.xml`, title: "Tags Index Feed" },
      { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ],
    filterFn: (post) => {
      if (Array.isArray(post.tags)) {
        return post.tags.some(t => matchesTag(t, tagSlug));
      }
      return false;
    },
  });
}

/**
 * Generates Tags Feed Index (/tags/rss.xml).
 */
export async function generateTagsRssFeed(
  event: H3Event,
  format: FeedFormat = "rss",
  extraRelatedFeeds: RelatedFeedLink[] = [],
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl).replace(/\/$/, "");
  const feedUrl = `${siteUrl}/tags/rss.xml`;

  const tags = await getAllTags(event);
  const allBlogs = sortBlogsByDateDesc(await getAllBlogs(event));

  const latestDate = getLatestBlogDate(allBlogs);
  if (isCacheFresh(event, latestDate)) {
    setResponseStatus(event, 304);
    return "";
  }

  const feed = new Feed({
    title: "NodeWave — Tags & Technology Topics Index",
    description: "Index of software topics, technology frameworks, and tags.",
    id: feedUrl,
    link: `${siteUrl}/tags`,
    language: "en",
    generator: "Nodewave RSS Engine",
    feedLinks: { rss2: feedUrl },
  });

  for (const tag of tags) {
    const tagUrl = `${siteUrl}/tags/${tag.slug}`;
    const tagBlogs = allBlogs.filter((blog) => {
      if (Array.isArray(blog.tags)) {
        return blog.tags.some(t => matchesTag(t, tag.slug));
      }
      return false;
    });

    const count = tagBlogs.length;
    const countLabel = `${count} ${count === 1 ? "article" : "articles"}`;
    const title = `#${tag.name || tag.slug} (${countLabel})`;

    let html = `<p>Articles tagged with <strong>#${escapeXml(tag.name || tag.slug)}</strong>.</p>`;
    if (count > 0) {
      html += `<h3>Tagged Articles (${count}):</h3><ul>`;
      for (const b of tagBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        const dateFormatted = b.date ? ` — <em>${formatDate(b.date)}</em>` : "";
        html += `<li><a href="${siteUrl}${bPath}">${escapeXml(b.title || "Untitled")}</a>${dateFormatted}</li>`;
      }
      html += `</ul>`;
    }

    const description = tag.description
      ? `${tag.description} (${countLabel})`
      : `Articles tagged under #${tag.name || tag.slug}. Contains ${countLabel}.`;

    feed.addItem({
      title,
      id: tagUrl,
      link: tagUrl,
      description,
      content: cleanRssHtml(html),
      date: getLatestBlogDate(tagBlogs),
    });
  }

  const tagRelatedFeeds: RelatedFeedLink[] = tags.map(tag => ({
    rel: "related",
    href: `${siteUrl}/tags/${tag.slug}/rss.xml`,
    title: `#${tag.name} Tag Feed`,
  }));

  const allRelatedFeeds: RelatedFeedLink[] = [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ...tagRelatedFeeds,
    ...extraRelatedFeeds,
  ];

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, allRelatedFeeds, siteUrl);
}
