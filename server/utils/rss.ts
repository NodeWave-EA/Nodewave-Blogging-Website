import { renderHTML } from "@comark/html";
import { Feed } from "feed";
import type { H3Event } from "h3";
import { getAllBlogs } from "~~/server/utils/content";

export interface FeedOptions {
  feedPath: string;
  titleSuffix?: string;
  description?: string;
  filterFn?: (post: any) => boolean;
}

export async function generateRssFeed(event: H3Event, options: FeedOptions): Promise<string> {
  const config = useRuntimeConfig(event);

  const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");
  const feedUrl = `${siteUrl}${options.feedPath}`;

  const feedTitle = options.titleSuffix
    ? `NodeWave — ${options.titleSuffix}`
    : "NodeWave Blogging Platform";

  const feedDescription =
    options.description ||
    "Latest technical articles, software architecture notes, and engineering logs from NodeWave.";

  const feed = new Feed({
    title: feedTitle,
    description: feedDescription,
    id: feedUrl,
    link: `${siteUrl}/`,
    language: "en",
    favicon: `${siteUrl}/favicon.ico`,
    image: `${siteUrl}/og-banner.png`,
    copyright: `Copyright © ${new Date().getFullYear()} NodeWave. All rights reserved.`,
    generator: "Nuxt Content v3 RSS Builder",
    feedLinks: {
      rss2: feedUrl,
    },
  });

  try {
    let blogPosts = await getAllBlogs(event);

    if (options.filterFn) {
      blogPosts = blogPosts.filter(options.filterFn);
    }

    const feedItems = await Promise.all(
      blogPosts.map(async (post) => {
        const postPath = post.path.startsWith("/") ? post.path : `/${post.path}`;
        const postUrl = `${siteUrl}${postPath}`;

        let htmlContent = post.description || "";

        if (post.body) {
          try {
            const comarkTree = {
              nodes: post.body.value || [],
              frontmatter: {},
              meta: {},
            };

            let rawHtml = await renderHTML(comarkTree as unknown as Parameters<typeof renderHTML>[0]);

            // Clean up attributes
            rawHtml = rawHtml.replace(/className=/g, "class=");
            rawHtml = rawHtml.replace(/\s*(code|language|meta)="[\s\S]*?"/g, "");
            rawHtml = rawHtml.replace(/\s*__ignoreMap(="[^"]*")?/g, "");

            // Convert relative links & images to absolute URLs for RSS readers
            rawHtml = rawHtml.replace(/href="#([^"]+)"/g, `href="${postUrl}#$1"`);
            rawHtml = rawHtml.replace(/href="\/([^"]+)"/g, `href="${siteUrl}/$1"`);
            rawHtml = rawHtml.replace(/src="\/([^"]+)"/g, `src="${siteUrl}/$1"`);

            htmlContent = rawHtml;
          }
          catch (e) {
            console.warn(`[RSS Builder] Failed to render HTML for: ${post.title}`, e);
          }
        }

        const authorName = typeof post.author === "string" ? post.author : post.author?.name || "NodeWave Team";
        const authorEmail = typeof post.author === "object" && post.author?.email ? post.author.email : `no-reply@nodewave.net`;

        // Extract Categories & Tags for RSS Taxonomy
        const categories = Array.isArray(post.categories)
          ? post.categories.map((cat: string | { name: string }) => typeof cat === "string" ? cat : cat.name)
          : post.category
            ? [typeof post.category === "string" ? post.category : post.category.name]
            : [];

        const tags = Array.isArray(post.tags)
          ? post.tags.map((tag: string | { name: string }) => typeof tag === "string" ? tag : tag.name)
          : [];

        const allTaxonomies = [...new Set([...categories, ...tags])];

        // Resolving Cover Image / Enclosure
        const coverImage = post.image || post.cover || post.ogImage;
        const imageUrl = coverImage ? (coverImage.startsWith("http") ? coverImage : `${siteUrl}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`) : undefined;

        return {
          title: post.title || "Untitled Article",
          id: postUrl,
          link: postUrl,
          description: post.description || "",
          content: htmlContent,
          date: post.date ? new Date(post.date) : new Date(),
          category: allTaxonomies.map(name => ({ name })),
          image: imageUrl,
          author: [
            {
              name: authorName,
              email: `${authorEmail} (${authorName})`,
            },
          ],
        };
      }),
    );

    feedItems.forEach(item => feed.addItem(item));

    let rssXml = feed.rss2();

    // Ensure Atom namespace & self link are present
    if (!rssXml.includes("rel=\"self\"")) {
      const atomLinkTag = `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`;

      if (!rssXml.includes("xmlns:atom")) {
        rssXml = rssXml.replace(
          "<rss version=\"2.0\"",
          "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\"",
        );
      }

      rssXml = rssXml.replace("<channel>", `<channel>\n        ${atomLinkTag}`);
    }

    setHeaders(event, {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    });

    return rssXml;
  }
  catch (error) {
    console.error(`[RSS Builder Error] Failed generating feed for ${options.feedPath}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error while generating RSS feed",
    });
  }
}

