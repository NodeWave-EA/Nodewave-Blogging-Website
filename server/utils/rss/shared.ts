import { getHeader, setHeaders } from "h3";

import type { FeedFormat, RelatedFeedLink } from "./types";
import type { Feed } from "feed";
import type { H3Event } from "h3";
import type { BlogType } from "~/types";

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
export function escapeXml(str: string): string {
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
export function formatDate(dateInput?: string | Date): string {
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
export function sortBlogsByDateDesc(blogs: BlogType[]): BlogType[] {
  return [...blogs].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Retrieves the latest valid date from a list of blogs or defaults to current date.
 */
export function getLatestBlogDate(blogs: BlogType[]): Date {
  const dates = blogs
    .map(b => (b.date ? new Date(b.date).getTime() : 0))
    .filter(t => !Number.isNaN(t) && t > 0);

  return dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
}

/**
 * Renders a tag name, props object, and children array into a valid HTML string.
 */
function renderHtmlElement(rawTag: string, props: Record<string, any>, children: any[]): string {
  let tagName = rawTag.toLowerCase();

  if (tagName === "codespan" || tagName === "code-inline" || tagName === "inline-code" || tagName === "codeinline") {
    tagName = "code";
  }
  else if (tagName === "binding" || tagName === "component") {
    return children.map(renderMiniMarkNode).join("");
  }

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

/**
 * Recursively parses Nuxt Content v2/v3 AST nodes (Object & MiniMark Tuples) to valid HTML string.
 */
export function renderMiniMarkNode(node: any): string {
  if (node == null)
    return "";

  if (typeof node === "string") {
    return escapeXml(node);
  }

  if (typeof node === "number" || typeof node === "boolean") {
    return String(node);
  }

  // Handle Object AST Nodes (Nuxt Content Hast/Unist AST objects)
  if (typeof node === "object" && !Array.isArray(node)) {
    if (node.type === "text" || (node.value !== undefined && typeof node.value === "string" && !node.tag && !node.type)) {
      return escapeXml(node.value || "");
    }

    if (node.type === "root" && Array.isArray(node.children)) {
      return node.children.map(renderMiniMarkNode).join("");
    }

    const rawTag = node.tag || node.name || (node.type === "element" ? node.tag || "div" : null);
    if (rawTag && typeof rawTag === "string") {
      const props = node.props || node.attributes || {};
      const children = Array.isArray(node.children) ? node.children : [];
      return renderHtmlElement(rawTag, props, children);
    }

    if (Array.isArray(node.children)) {
      return node.children.map(renderMiniMarkNode).join("");
    }

    if (node.value !== undefined) {
      return escapeXml(String(node.value));
    }

    return "";
  }

  // Handle Array Nodes (MiniMark tuples [tag, props, ...children] or lists of nodes)
  if (Array.isArray(node)) {
    if (node.length === 0)
      return "";

    const first = node[0];

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

      return renderHtmlElement(rawTag, props, children);
    }

    return node.map(renderMiniMarkNode).join("");
  }

  return "";
}

/**
 * Entry point for rendering MiniMark / Nuxt Content AST value trees.
 */
export function renderMiniMarkToHtml(nodes: any): string {
  if (!nodes)
    return "";
  if (Array.isArray(nodes)) {
    return nodes.map(renderMiniMarkNode).join("");
  }
  return renderMiniMarkNode(nodes);
}

/**
 * Sanitizes HTML content for RSS consumption and strips orphaned tags.
 */
export function cleanRssHtml(html: string): string {
  if (!html)
    return "";
  let cleaned = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/class="\[\\?&quot;(.*?)\\?&quot;\]"/g, "class=\"$1\"")
    .replace(/class="\["(.*?)"\]"/g, "class=\"$1\"")
    .replace(/class="([^"]*)"@[^"]*"/g, "class=\"$1\"")
    .replace(/\s*__ignoreMap(=("[^"]*"|'[^']*'))?/g, "")
    .trim();

  // Strip residual leading orphaned closing tags
  cleaned = cleaned.replace(/^(?:\s*<\/span>)+/gi, "");

  return cleaned;
}

/**
 * Evaluates If-Modified-Since headers for 304 responses.
 */
export function isCacheFresh(event: H3Event, latestDate: Date): boolean {
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
 * Injects absolute XSL stylesheet reference, Atom/Media RSS namespaces, and relational links.
 */
export function finalizeXmlOutput(
  rawXml: string,
  selfUrl: string,
  relatedFeeds: RelatedFeedLink[] = [],
  siteUrl: string = "https://nodewaveblog.vercel.app",
): string {
  let xml = rawXml;
  const xslUrl = `${siteUrl.replace(/\/$/, "")}/feed.xsl`;

  if (!xml.includes("xml-stylesheet")) {
    xml = xml.replace(
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
      `<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="${escapeXml(xslUrl)}"?>`,
    );
  }

  if (!xml.includes("xmlns:atom")) {
    xml = xml.replace(
      "<rss version=\"2.0\"",
      "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:media=\"https://search.yahoo.com/mrss/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:content=\"http://purl.org/rss/1.0/modules/content/\"",
    );
  }

  let atomLinks = `  <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />`;
  for (const feed of relatedFeeds) {
    atomLinks += `\n        <atom:link href="${escapeXml(feed.href)}" rel="${feed.rel}" type="application/rss+xml" title="${escapeXml(feed.title)}" />`;
  }

  return xml.replace("<channel>", `<channel>\n        ${atomLinks}`);
}

/**
 * Sets Content-Type header to application/xml for browser XSL execution.
 */
export function renderFeedResponse(
  event: H3Event,
  feed: Feed,
  latestDate: Date,
  feedUrl: string,
  format: FeedFormat = "rss",
  relatedFeeds: RelatedFeedLink[] = [],
  siteUrl: string = "https://nodewaveblog.vercel.app",
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
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, must-revalidate",
    "Last-Modified": latestDate.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });

  return finalizeXmlOutput(feed.rss2(), feedUrl, relatedFeeds, siteUrl);
}
