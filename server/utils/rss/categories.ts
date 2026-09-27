import { Feed } from "feed";
import { setResponseStatus } from "h3";
import { getAllBlogs, getAllCategories, matchesCategory } from "~~/server/utils/content";

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
 * Generates individual Category Feed (/categories/:slug/rss.xml).
 */
export async function generateCategoryRssFeed(
  event: H3Event,
  categorySlug: string,
  format: FeedFormat = "rss",
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");

  const categories = await getAllCategories(event);
  const category = categories.find(c => c.slug === categorySlug);
  const catName = category?.name || categorySlug;

  return generateBlogRssFeed(event, {
    feedPath: `/categories/${categorySlug}/rss.xml`,
    titleSuffix: `Category: ${catName}`,
    description: category?.description || `Technical articles and development guides under the ${catName} category on NodeWave.`,
    format,
    relatedFeeds: [
      { rel: "up", href: `${siteUrl}/categories/rss.xml`, title: "Categories Roster Feed" },
      { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ],
    filterFn: (post) => {
      if (Array.isArray(post.categories)) {
        return post.categories.some(c => matchesCategory(c, categorySlug));
      }
      return false;
    },
  });
}

/**
 * Generates Categories Feed Index (/categories/rss.xml).
 */
export async function generateCategoriesRssFeed(
  event: H3Event,
  format: FeedFormat = "rss",
  extraRelatedFeeds: RelatedFeedLink[] = [],
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");
  const feedUrl = `${siteUrl}/categories/rss.xml`;

  const categories = await getAllCategories(event);
  const allBlogs = sortBlogsByDateDesc(await getAllBlogs(event));

  const latestDate = getLatestBlogDate(allBlogs);
  if (isCacheFresh(event, latestDate)) {
    setResponseStatus(event, 304);
    return "";
  }

  const feed = new Feed({
    title: "NodeWave — Categories & Domains Index",
    description: "Index of structured technical categories and architectural domains.",
    id: feedUrl,
    link: `${siteUrl}/categories`,
    language: "en",
    generator: "Nodewave RSS Engine",
    feedLinks: { rss2: feedUrl },
  });

  for (const category of categories) {
    const categoryUrl = `${siteUrl}/categories/${category.slug}`;
    const categoryBlogs = allBlogs.filter((blog) => {
      if (Array.isArray(blog.categories)) {
        return blog.categories.some(c => matchesCategory(c, category.slug));
      }
      return false;
    });

    const count = categoryBlogs.length;
    const countLabel = `${count} ${count === 1 ? "article" : "articles"}`;
    const title = `${category.name || category.slug} (${countLabel})`;

    let html = `<p>${escapeXml(category.description || `Technical articles under ${category.name}.`)}</p>`;
    if (count > 0) {
      html += `<h3>Articles in ${escapeXml(category.name || category.slug)} (${count}):</h3><ul>`;
      for (const b of categoryBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        const dateFormatted = b.date ? ` — <em>${formatDate(b.date)}</em>` : "";
        html += `<li><a href="${siteUrl}${bPath}">${escapeXml(b.title || "Untitled")}</a>${dateFormatted}</li>`;
      }
      html += `</ul>`;
    }

    const description = category.description
      ? `${category.description} (${countLabel})`
      : `Category overview for ${category.name || category.slug}. Contains ${countLabel}.`;

    feed.addItem({
      title,
      id: categoryUrl,
      link: categoryUrl,
      description,
      content: cleanRssHtml(html),
      date: getLatestBlogDate(categoryBlogs),
    });
  }

  const categoryRelatedFeeds: RelatedFeedLink[] = categories.map(cat => ({
    rel: "related",
    href: `${siteUrl}/categories/${cat.slug}/rss.xml`,
    title: `${cat.name} Category Feed`,
  }));

  const allRelatedFeeds: RelatedFeedLink[] = [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Master Root Feed" },
    ...categoryRelatedFeeds,
    ...extraRelatedFeeds,
  ];

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, allRelatedFeeds, siteUrl);
}
