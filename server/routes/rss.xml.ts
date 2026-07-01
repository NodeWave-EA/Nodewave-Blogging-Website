import { renderHTML } from "@comark/html";
import { Feed } from "feed";
import { getAllBlogs } from "~~/server/utils/content";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const siteUrl = config.public.siteUrl || "https://blog.nodewave.net";
  const BASE_URL = siteUrl.replace(/\/$/, "");
  const FEED_URL = `${BASE_URL}/rss.xml`;

  const feed = new Feed({
    title: "NodeWave Blogging Platform",
    description: "Latest insights, tutorials, and updates.",
    id: FEED_URL,
    link: `${BASE_URL}/`,
    language: "en",
    favicon: `${BASE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    generator: "Nuxt Content v3 RSS Generator",
    feedLinks: {
      rss2: FEED_URL,
    },
  });

  try {
    const blogPosts = await getAllBlogs(event);

    const feedItems = await Promise.all(
      blogPosts.map(async (post) => {
        const postPath = post.path.startsWith("/") ? post.path : `/${post.path}`;
        const postUrl = `${BASE_URL}${postPath}`;

        let htmlContent = post.description || "";
        if (post.body) {
          try {
            const comarkTree = {
              nodes: post.body.value || [],
              frontmatter: {},
              meta: {},
            };

            let rawHtml = await renderHTML(comarkTree as unknown as Parameters<typeof renderHTML>[0]);

            rawHtml = rawHtml.replace(/className=/g, "class=");
            rawHtml = rawHtml.replace(/\s*(code|language|meta)="[\s\S]*?"/g, "");
            rawHtml = rawHtml.replace(/\s*__ignoreMap(="[^"]*")?/g, "");
            rawHtml = rawHtml.replace(/href="#([^"]+)"/g, `href="${postUrl}#$1"`);

            htmlContent = rawHtml;
          }
          catch (e) {
            console.warn(`Failed to render Comark AST for post: ${post.title}`, e);
          }
        }

        const authorName = typeof post.author === "string" ? post.author : post.author?.name || "Anonymous";

        return {
          title: post.title || "Untitled Post",
          id: postUrl,
          link: postUrl,
          description: post.description || "",
          content: htmlContent,
          date: post.date ? new Date(post.date) : new Date(),
          author: [
            {
              name: authorName,
              email: `no-reply@yourdomain.com (${authorName})`,
            },
          ],
        };
      }),
    );

    feedItems.forEach(item => feed.addItem(item));

    let rssXml = feed.rss2();

    if (!rssXml.includes("rel=\"self\"")) {
      const atomLinkTag = `<atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />`;

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
    console.error("Error generating RSS feed:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error while generating feed",
    });
  }
});
