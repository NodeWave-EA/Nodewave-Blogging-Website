<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> (RSS Feed)</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            --bg: #090d16;
            --card-bg: #111827;
            --border: #1f2937;
            --text: #f3f4f6;
            --text-muted: #9ca3af;
            --primary: #38bdf8;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 2rem 1rem;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .banner {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          .banner h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            color: var(--primary);
          }
          .banner p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.95rem;
          }
          .notice {
            background: rgba(56, 189, 248, 0.1);
            border-left: 4px solid var(--primary);
            padding: 0.75rem 1rem;
            margin-top: 1rem;
            border-radius: 4px;
            font-size: 0.85rem;
            color: var(--text);
          }
          .feed-item {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 1.25rem;
            margin-bottom: 1rem;
          }
          .feed-item h2 {
            margin: 0 0 0.25rem 0;
            font-size: 1.15rem;
          }
          .feed-item h2 a {
            color: var(--text);
            text-decoration: none;
          }
          .feed-item h2 a:hover {
            color: var(--primary);
          }
          .date {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          }
          .description {
            font-size: 0.9rem;
            color: var(--text-muted);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="banner">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <div class="notice">
              <strong>RSS Feed:</strong> Copy this URL into your feed reader (Feedly, Inoreader, NetNewsWire, etc.) to subscribe.
            </div>
          </div>

          <main>
            <xsl:for-each select="/rss/channel/item">
              <article class="feed-item">
                <h2>
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h2>
                <div class="date">
                  <xsl:value-of select="pubDate"/>
                </div>
                <div class="description">
                  <xsl:value-of select="description" disable-output-escaping="yes"/>
                </div>
              </article>
            </xsl:for-each>
          </main>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
