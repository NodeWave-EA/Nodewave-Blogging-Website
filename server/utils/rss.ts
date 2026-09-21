import { renderHTML } from "@comark/html";
import { Feed } from "feed";
import { getHeader, setHeaders, setResponseStatus } from "h3";
import { getAllAuthors, getAllBlogs, getAllCategories, getAllTags } from "~~/server/utils/content";

import type { H3Event } from "h3";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

export type FeedFormat = "rss" | "atom" | "json";

export type RelatedFeedLink = {
  rel: "self" | "related" | "up" | "alternate";
  href: string;
  title: string;
};

/**
 * Safely escapes special XML characters.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formats a raw date value into a human-readable date string.
 */
function formatDate(dateInput?: string | Date): string {
  if (!dateInput)
    return "";
  const d = new Date(dateInput);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Sorts an array of blogs in descending order by publication date.
 */
function sortBlogsByDateDesc(blogs: BlogType[]): BlogType[] {
  return [...blogs].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Retrieves the latest valid date from a list of blogs or defaults to current date.
 */
function getLatestBlogDate(blogs: BlogType[]): Date {
  const dates = blogs
    .map(b => (b.date ? new Date(b.date).getTime() : 0))
    .filter(t => !Number.isNaN(t) && t > 0);

  return dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
}

/**
 * Sanitizes HTML content for RSS consumption by stripping style blocks,
 * internal AST attributes, and fixing malformed Shiki code block attributes.
 */
function cleanRssHtml(html: string): string {
  if (!html)
    return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/class="\[\\?&quot;(.*?)\\?&quot;\]"/g, "class=\"$1\"")
    .replace(/class="\["(.*?)"\]"/g, "class=\"$1\"")
    .replace(/class="([^"]*)"@[^"]*"/g, "class=\"$1\"")
    .replace(/\s*__ignoreMap(=("[^"]*"|'[^']*'))?/g, "")
    .trim();
}

/**
 * Evaluates If-Modified-Since headers to issue 304 Not Modified responses when unchanged.
 */
function isCacheFresh(event: H3Event, latestDate: Date): boolean {
  const ifModifiedSince = getHeader(event, "if-modified-since");
  if (ifModifiedSince) {
    const clientDate = new Date(ifModifiedSince);
    if (!Number.isNaN(clientDate.getTime()) && clientDate >= latestDate) {
      return true;
    }
  }
  return false;
}

/**
 * Injects XSL stylesheet reference, Atom/Media RSS namespaces, and relational links.
 */
function finalizeXmlOutput(
  rawXml: string,
  selfUrl: string,
  relatedFeeds: RelatedFeedLink[] = [],
  xslPath = "/feed.xsl",
): string {
  let xml = rawXml;

  // 1. Inject XSLT processing instruction for styled browser view
  if (!xml.includes("xml-stylesheet")) {
    xml = xml.replace(
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
      `<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="${escapeXml(xslPath)}"?>`,
    );
  }

  // 2. Inject Atom and Media RSS (xmlns:media) namespaces
  if (!xml.includes("xmlns:atom")) {
    xml = xml.replace(
      "<rss version=\"2.0\"",
      "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:media=\"http://search.yahoo.com/mrss/\"",
    );
  }

  // 3. Inject Atom relational links
  let atomLinks = `  <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />`;
  for (const feed of relatedFeeds) {
    atomLinks += `\n        <atom:link href="${escapeXml(feed.href)}" rel="${feed.rel}" type="application/rss+xml" title="${escapeXml(feed.title)}" />`;
  }

  return xml.replace("<channel>", `<channel>\n        ${atomLinks}`);
}

/**
 * Helper to set HTTP headers and export the feed in the requested format (RSS 2.0, Atom 1.0, or JSON Feed 1.1).
 */
function renderFeedResponse(
  event: H3Event,
  feed: Feed,
  latestDate: Date,
  feedUrl: string,
  format: FeedFormat = "rss",
  relatedFeeds: RelatedFeedLink[] = [],
): string {
  if (format === "json") {
    setHeaders(event, {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "Last-Modified": latestDate.toUTCString(),
      "X-Content-Type-Options": "nosniff",
    });
    return feed.json1();
  }

  if (format === "atom") {
    setHeaders(event, {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "Last-Modified": latestDate.toUTCString(),
      "X-Content-Type-Options": "nosniff",
    });
    return feed.atom1();
  }

  setHeaders(event, {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, must-revalidate",
    "Last-Modified": latestDate.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });

  return finalizeXmlOutput(feed.rss2(), feedUrl, relatedFeeds);
}

/**
 * Builds standard blog post RSS feed with embedded entity relationships.
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
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
  const feedUrl = `${siteUrl}${options.feedPath}`;

  let posts = await getAllBlogs(event);
  if (options.filterFn) {
    posts = posts.filter(options.filterFn);
  }

  // 1. Explicitly sort posts in reverse chronological order
  posts = sortBlogsByDateDesc(posts);

  // 2. HTTP 304 Conditional Cache Check
  const latestDate = getLatestBlogDate(posts);
  if (isCacheFresh(event, latestDate)) {
    setResponseStatus(event, 304);
    return "";
  }

  const feed = new Feed({
    title: options.titleSuffix ? `NodeWave — ${options.titleSuffix}` : "NodeWave Blogging Platform",
    description: options.description || "Latest technical articles, software architecture notes, and engineering logs.",
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
        const comarkTree = { nodes: post.body.value || [], frontmatter: {}, meta: {} };
        let rawHtml = await renderHTML(comarkTree as unknown as Parameters<typeof renderHTML>[0]);

        rawHtml = rawHtml.replace(/className=/g, "class=");
        rawHtml = rawHtml.replace(/\s*(code|language|meta)="[\s\S]*?"/g, "");
        rawHtml = rawHtml.replace(/href="#([^"]+)"/g, `href="${postUrl}#$1"`);
        rawHtml = rawHtml.replace(/href="\/([^"]+)"/g, `href="${siteUrl}/$1"`);
        rawHtml = rawHtml.replace(/src="\/([^"]+)"/g, `src="${siteUrl}/$1"`);

        bodyHtml = cleanRssHtml(rawHtml);
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

  return renderFeedResponse(event, feed, latestDate, feedUrl, options.format || "rss", options.relatedFeeds);
}

/**
 * Generates Authors Feed (/authors/rss.xml) linking each author to their published articles.
 */
export async function generateAuthorsRssFeed(event: H3Event, format: FeedFormat = "rss"): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
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
      return blog.author === author.slug;
    });

    let html = `<p>${escapeXml(author.bio || "Core technical contributor at NodeWave.")}</p>`;
    if (authorBlogs.length > 0) {
      html += `<h3>Published Articles (${authorBlogs.length}):</h3><ul>`;
      for (const b of authorBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        const dateFormatted = b.date ? ` — <em>${formatDate(b.date)}</em>` : "";
        html += `<li><a href="${siteUrl}${bPath}">${escapeXml(b.title || "Untitled")}</a>${dateFormatted}</li>`;
      }
      html += `</ul>`;
    }

    feed.addItem({
      title: author.name || author.slug,
      id: authorUrl,
      link: authorUrl,
      description: author.bio || `Author profile for ${author.name}`,
      content: cleanRssHtml(html),
      date: getLatestBlogDate(authorBlogs),
    });
  }

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Root RSS Feed" },
  ]);
}

/**
 * Generates Categories Feed (/categories/rss.xml) linking each category to its articles.
 */
export async function generateCategoriesRssFeed(event: H3Event, format: FeedFormat = "rss"): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
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
        return blog.categories.some(c => (typeof c === "object" ? c.slug : c) === category.slug);
      }
      return false;
    });

    let html = `<p>${escapeXml(category.description || `Technical articles under ${category.name}.`)}</p>`;
    if (categoryBlogs.length > 0) {
      html += `<h3>Articles in ${escapeXml(category.name)} (${categoryBlogs.length}):</h3><ul>`;
      for (const b of categoryBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        const dateFormatted = b.date ? ` — <em>${formatDate(b.date)}</em>` : "";
        html += `<li><a href="${siteUrl}${bPath}">${escapeXml(b.title || "Untitled")}</a>${dateFormatted}</li>`;
      }
      html += `</ul>`;
    }

    feed.addItem({
      title: category.name || category.slug,
      id: categoryUrl,
      link: categoryUrl,
      description: category.description || `Category overview for ${category.name}`,
      content: cleanRssHtml(html),
      date: getLatestBlogDate(categoryBlogs),
    });
  }

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Root RSS Feed" },
  ]);
}

/**
 * Generates Tags Feed (/tags/rss.xml) linking each tag to its tagged articles.
 */
export async function generateTagsRssFeed(event: H3Event, format: FeedFormat = "rss"): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
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
        return blog.tags.some(t => (typeof t === "object" ? t.slug : t) === tag.slug);
      }
      return false;
    });

    let html = `<p>Articles tagged with <strong>#${escapeXml(tag.name)}</strong>.</p>`;
    if (tagBlogs.length > 0) {
      html += `<h3>Tagged Articles (${tagBlogs.length}):</h3><ul>`;
      for (const b of tagBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        const dateFormatted = b.date ? ` — <em>${formatDate(b.date)}</em>` : "";
        html += `<li><a href="${siteUrl}${bPath}">${escapeXml(b.title || "Untitled")}</a>${dateFormatted}</li>`;
      }
      html += `</ul>`;
    }

    feed.addItem({
      title: `#${tag.name || tag.slug}`,
      id: tagUrl,
      link: tagUrl,
      description: `Articles tagged under #${tag.name}`,
      content: cleanRssHtml(html),
      date: getLatestBlogDate(tagBlogs),
    });
  }

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Root RSS Feed" },
  ]);
}
