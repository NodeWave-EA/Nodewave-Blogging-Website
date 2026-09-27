import { renderHtml } from "@comark/html";
import { Feed } from "feed";
import { getHeader, setHeaders, setResponseStatus } from "h3";
import {
  getAllAuthors,
  getAllBlogs,
  getAllCategories,
  getAllTags,
  matchesCategory,
  matchesTag,
} from "~~/server/utils/content";

import type { H3Event } from "h3";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

export type FeedFormat = "rss" | "atom" | "json";

export type RelatedFeedLink = {
  rel: "self" | "related" | "up" | "alternate";
  href: string;
  title: string;
};

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const STANDARD_HTML_TAGS = new Set([
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
]);

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
 * Recursively parses Nuxt Content v3 MiniMark AST nodes to valid HTML string.
 */
function renderMiniMarkNode(node: any): string {
  if (node == null)
    return "";

  if (typeof node === "string") {
    return escapeXml(node);
  }

  if (typeof node === "number" || typeof node === "boolean") {
    return String(node);
  }

  // MiniMark tuple: [tag, props?, ...children]
  if (Array.isArray(node)) {
    if (node.length === 0)
      return "";

    const first = node[0];

    // Check if element 0 is a tag name (e.g. "p", "li", "codespan")
    if (typeof first === "string" && /^[\w:-]+$/.test(first)) {
      const rawTag = first;
      let props: Record<string, any> = {};
      let children: any[] = [];

      const second = node[1];
      if (second && typeof second === "object" && !Array.isArray(second)) {
        props = second;
        children = node.slice(2);
      }
      else {
        children = node.slice(1);
      }

      // Unpack nested child arrays if present
      if (children.length === 1 && Array.isArray(children[0]) && typeof children[0][0] !== "string") {
        children = children[0];
      }

      let tagName = rawTag.toLowerCase();

      // Normalize custom MiniMark internal tags to standard HTML
      if (tagName === "codespan" || tagName === "code-inline" || tagName === "inline-code" || tagName === "codeinline") {
        tagName = "code";
      }
      else if (tagName === "binding" || tagName === "component") {
        return children.map(renderMiniMarkNode).join("");
      }

      // Fallback non-standard MDC components to div containers
      if (!STANDARD_HTML_TAGS.has(tagName)) {
        tagName = "div";
      }

      let attrStr = "";
      for (const [key, val] of Object.entries(props)) {
        if (val == null || val === false)
          continue;
        if (key.startsWith("__") || key === "key" || key === "v-bind")
          continue;

        if (val === true) {
          attrStr += ` ${key}`;
        }
        else {
          attrStr += ` ${key}="${escapeXml(String(val))}"`;
        }
      }

      if (VOID_ELEMENTS.has(tagName)) {
        return `<${tagName}${attrStr} />`;
      }

      const innerHtml = children.map(renderMiniMarkNode).join("");
      return `<${tagName}${attrStr}>${innerHtml}</${tagName}>`;
    }

    // Standard list of child nodes
    return node.map(renderMiniMarkNode).join("");
  }

  // Standard object nodes ({ value } or { children })
  if (typeof node === "object") {
    if (node.value && typeof node.value === "string") {
      return escapeXml(node.value);
    }
    if (Array.isArray(node.children)) {
      return node.children.map(renderMiniMarkNode).join("");
    }
  }

  return "";
}

/**
 * Entry point for rendering MiniMark AST value trees.
 */
function renderMiniMarkToHtml(nodes: any[]): string {
  if (!Array.isArray(nodes))
    return "";
  return nodes.map(renderMiniMarkNode).join("");
}

/**
 * Sanitizes HTML content for RSS consumption.
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
 * Evaluates If-Modified-Since headers for 304 responses.
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

  if (!xml.includes("xml-stylesheet")) {
    xml = xml.replace(
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
      `<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="${escapeXml(xslPath)}"?>`,
    );
  }

  if (!xml.includes("xmlns:atom")) {
    xml = xml.replace(
      "<rss version=\"2.0\"",
      "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:media=\"https://search.yahoo.com/mrss/\"",
    );
  }

  let atomLinks = `  <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />`;
  for (const feed of relatedFeeds) {
    atomLinks += `\n        <atom:link href="${escapeXml(feed.href)}" rel="${feed.rel}" type="application/rss+xml" title="${escapeXml(feed.title)}" />`;
  }

  return xml.replace("<channel>", `<channel>\n        ${atomLinks}`);
}

/**
 * Helper to set HTTP headers and export the feed.
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
 * Builds standard blog post RSS feed.
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
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");
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

  return renderFeedResponse(event, feed, latestDate, feedUrl, options.format || "rss", options.relatedFeeds);
}

/**
 * Generates Authors Feed (/authors/rss.xml).
 */
export async function generateAuthorsRssFeed(event: H3Event, format: FeedFormat = "rss"): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");
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

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Root RSS Feed" },
  ]);
}

/**
 * Generates Categories Feed (/categories/rss.xml).
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

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, allRelatedFeeds);
}

/**
 * Generates Tags Feed (/tags/rss.xml).
 */
export async function generateTagsRssFeed(
  event: H3Event,
  format: FeedFormat = "rss",
  extraRelatedFeeds: RelatedFeedLink[] = [],
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");
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

  return renderFeedResponse(event, feed, latestDate, feedUrl, format, allRelatedFeeds);
}
