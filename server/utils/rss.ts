import { renderHTML } from "@comark/html";
import { Feed } from "feed";
import type { H3Event } from "h3";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";
import { getAllAuthors, getAllBlogs, getAllCategories, getAllTags } from "~~/server/utils/content";

export interface RelatedFeedLink {
  rel: "self" | "related" | "up" | "alternate";
  href: string;
  title: string;
}

/**
 * Injects Atom namespace and relational <atom:link> elements into generated RSS XML.
 */
function injectAtomLinks(rssXml: string, selfUrl: string, relatedFeeds: RelatedFeedLink[] = []): string {
  let atomLinks = `  <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />`;

  for (const feed of relatedFeeds) {
    atomLinks += `\n        <atom:link href="${feed.href}" rel="${feed.rel}" type="application/rss+xml" title="${feed.title}" />`;
  }

  let xml = rssXml;
  if (!xml.includes("xmlns:atom")) {
    xml = xml.replace('<rss version="2.0"', '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"');
  }

  return xml.replace("<channel>", `<channel>\n        ${atomLinks}`);
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
    relatedFeeds?: RelatedFeedLink[];
    filterFn?: (post: BlogType) => boolean;
  },
): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
  const feedUrl = `${siteUrl}${options.feedPath}`;

  const feed = new Feed({
    title: options.titleSuffix ? `NodeWave — ${options.titleSuffix}` : "NodeWave Blogging Platform",
    description: options.description || "Latest technical articles, software architecture notes, and engineering logs.",
    id: feedUrl,
    link: `${siteUrl}/`,
    language: "en",
    favicon: `${siteUrl}/favicon.ico`,
    image: `${siteUrl}/og-banner.png`,
    copyright: `Copyright © ${new Date().getFullYear()} NodeWave. All rights reserved.`,
    generator: "Nuxt Content v3 Relational RSS Engine",
    feedLinks: { rss2: feedUrl },
  });

  let posts = await getAllBlogs(event);
  if (options.filterFn) {
    posts = posts.filter(options.filterFn);
  }

  for (const post of posts) {
    const postPath = post.path.startsWith("/") ? post.path : `/${post.path}`;
    const postUrl = `${siteUrl}${postPath}`;

    // Extract resolved relationships from enrichBlog
    const authorObj = typeof post.author === "object" ? (post.author as BlogAuthor) : null;
    const authorName = authorObj?.name || (typeof post.author === "string" ? post.author : "NodeWave Team");
    const authorSlug = authorObj?.slug || "";
    const authorUrl = authorSlug ? `${siteUrl}/authors/${authorSlug}` : `${siteUrl}/authors`;

    const categories = Array.isArray(post.categories) ? (post.categories as BlogCategory[]) : [];
    const tags = Array.isArray(post.tags) ? (post.tags as BlogTag[]) : [];

    // Render Comark body to HTML
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

        bodyHtml = rawHtml;
      }
      catch (e) {
        console.warn(`[RSS Builder] Error rendering HTML for ${post.title}`, e);
      }
    }

    // Build relational metadata footer for XML content readers
    let footerHtml = `<hr /><div style="margin-top: 16px; font-size: 13px; color: #555;">`;
    footerHtml += `<p><strong>Author:</strong> <a href="${authorUrl}">${authorName}</a></p>`;

    if (categories.length > 0) {
      const categoryLinks = categories
        .map(c => `<a href="${siteUrl}/categories/${c.slug}">${c.name}</a>`)
        .join(", ");
      footerHtml += `<p><strong>Categories:</strong> ${categoryLinks}</p>`;
    }

    if (tags.length > 0) {
      const tagLinks = tags.map(t => `<a href="${siteUrl}/tags/${t.slug}">#${t.name}</a>`).join(" ");
      footerHtml += `<p><strong>Tags:</strong> ${tagLinks}</p>`;
    }
    footerHtml += `</div>`;

    const fullContentHtml = `${bodyHtml}\n${footerHtml}`;

    // Map Category XML nodes with domain attributes
    const xmlCategories = [
      ...categories.map(c => ({ name: c.name, domain: `${siteUrl}/categories/${c.slug}` })),
      ...tags.map(t => ({ name: t.name, domain: `${siteUrl}/tags/${t.slug}` })),
    ];

    const coverImage = post.image || post.cover || post.ogImage;
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
      content: fullContentHtml,
      date: post.date ? new Date(post.date) : new Date(),
      category: xmlCategories,
      image: imageUrl,
      author: [{ name: authorName, email: `no-reply@nodewave.net (${authorName})` }],
    });
  }

  setHeaders(event, {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, must-revalidate",
    "X-Content-Type-Options": "nosniff",
  });

  return injectAtomLinks(feed.rss2(), feedUrl, options.relatedFeeds);
}

/**
 * Generates Authors Feed (/authors/rss.xml) linking each author to their published articles.
 */
export async function generateAuthorsRssFeed(event: H3Event): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
  const feedUrl = `${siteUrl}/authors/rss.xml`;

  const feed = new Feed({
    title: "NodeWave — Editorial Roster & Authors Index",
    description: "Index of core contributors, technical architects, and their published articles.",
    id: feedUrl,
    link: `${siteUrl}/authors`,
    language: "en",
    generator: "Nuxt Content v3 Relational RSS Engine",
    feedLinks: { rss2: feedUrl },
  });

  const authors = await getAllAuthors(event);
  const allBlogs = await getAllBlogs(event);

  for (const author of authors) {
    const authorUrl = `${siteUrl}/authors/${author.slug}`;
    const authorBlogs = allBlogs.filter((blog) => {
      if (typeof blog.author === "object" && blog.author?.slug) {
        return blog.author.slug === author.slug;
      }
      return blog.author === author.slug;
    });

    let html = `<p>${author.bio || "Core technical contributor at NodeWave."}</p>`;
    if (authorBlogs.length > 0) {
      html += `<h3>Published Articles (${authorBlogs.length}):</h3><ul>`;
      for (const b of authorBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        html += `<li><a href="${siteUrl}${bPath}">${b.title}</a> — <em>${b.date ? new Date(b.date).toLocaleDateString() : ""}</em></li>`;
      }
      html += `</ul>`;
    }

    feed.addItem({
      title: author.name || author.slug,
      id: authorUrl,
      link: authorUrl,
      description: author.bio || `Author profile for ${author.name}`,
      content: html,
      date: new Date(),
    });
  }

  setHeaders(event, {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, must-revalidate",
  });

  return injectAtomLinks(feed.rss2(), feedUrl, [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Root RSS Feed" },
  ]);
}

/**
 * Generates Categories Feed (/categories/rss.xml) linking each category to its articles.
 */
export async function generateCategoriesRssFeed(event: H3Event): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
  const feedUrl = `${siteUrl}/categories/rss.xml`;

  const feed = new Feed({
    title: "NodeWave — Categories & Domains Index",
    description: "Index of structured technical categories and architectural domains.",
    id: feedUrl,
    link: `${siteUrl}/categories`,
    language: "en",
    generator: "Nuxt Content v3 Relational RSS Engine",
    feedLinks: { rss2: feedUrl },
  });

  const categories = await getAllCategories(event);
  const allBlogs = await getAllBlogs(event);

  for (const category of categories) {
    const categoryUrl = `${siteUrl}/categories/${category.slug}`;
    const categoryBlogs = allBlogs.filter((blog) => {
      if (Array.isArray(blog.categories)) {
        return blog.categories.some(c => (typeof c === "object" ? c.slug : c) === category.slug);
      }
      return false;
    });

    let html = `<p>${category.description || `Technical articles under ${category.name}.`}</p>`;
    if (categoryBlogs.length > 0) {
      html += `<h3>Articles in ${category.name} (${categoryBlogs.length}):</h3><ul>`;
      for (const b of categoryBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        html += `<li><a href="${siteUrl}${bPath}">${b.title}</a></li>`;
      }
      html += `</ul>`;
    }

    feed.addItem({
      title: category.name || category.slug,
      id: categoryUrl,
      link: categoryUrl,
      description: category.description || `Category overview for ${category.name}`,
      content: html,
      date: new Date(),
    });
  }

  setHeaders(event, {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, must-revalidate",
  });

  return injectAtomLinks(feed.rss2(), feedUrl, [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Root RSS Feed" },
  ]);
}

/**
 * Generates Tags Feed (/tags/rss.xml) linking each tag to its tagged articles.
 */
export async function generateTagsRssFeed(event: H3Event): Promise<string> {
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
  const feedUrl = `${siteUrl}/tags/rss.xml`;

  const feed = new Feed({
    title: "NodeWave — Tags & Technology Topics Index",
    description: "Index of software topics, technology frameworks, and tags.",
    id: feedUrl,
    link: `${siteUrl}/tags`,
    language: "en",
    generator: "Nuxt Content v3 Relational RSS Engine",
    feedLinks: { rss2: feedUrl },
  });

  const tags = await getAllTags(event);
  const allBlogs = await getAllBlogs(event);

  for (const tag of tags) {
    const tagUrl = `${siteUrl}/tags/${tag.slug}`;
    const tagBlogs = allBlogs.filter((blog) => {
      if (Array.isArray(blog.tags)) {
        return blog.tags.some(t => (typeof t === "object" ? t.slug : t) === tag.slug);
      }
      return false;
    });

    let html = `<p>Articles tagged with <strong>#${tag.name}</strong>.</p>`;
    if (tagBlogs.length > 0) {
      html += `<h3>Tagged Articles (${tagBlogs.length}):</h3><ul>`;
      for (const b of tagBlogs) {
        const bPath = b.path.startsWith("/") ? b.path : `/${b.path}`;
        html += `<li><a href="${siteUrl}${bPath}">${b.title}</a></li>`;
      }
      html += `</ul>`;
    }

    feed.addItem({
      title: `#${tag.name || tag.slug}`,
      id: tagUrl,
      link: tagUrl,
      description: `Articles tagged under #${tag.name}`,
      content: html,
      date: new Date(),
    });
  }

  setHeaders(event, {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, must-revalidate",
  });

  return injectAtomLinks(feed.rss2(), feedUrl, [
    { rel: "up", href: `${siteUrl}/rss.xml`, title: "Root RSS Feed" },
  ]);
}
