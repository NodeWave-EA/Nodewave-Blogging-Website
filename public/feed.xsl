<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> (RSS Feed)</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          /* NodeWave Dark Reading RSS Theme */
          :root {
          --bg: #0b0f17;
          --card-bg: rgba(17, 24, 39, 0.65);
          --card-border: rgba(31, 41, 55, 0.8);
          --text: #f3f4f6;
          --text-muted: #9ca3af;
          --primary: #14b8a6;
          --primary-hover: #0d9488;
          --accent-blue: #0284c7;
          }
          * { box-sizing: border-box; }
          body {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: var(--bg);
          color: var(--text);
          margin: 0;
          padding: 0;
          line-height: 1.6;
          }

          /* Sticky Header Bar */
          .top-bar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(11, 15, 23, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--card-border);
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          }
          .top-bar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          }
          .top-bar-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          }
          .reader-select {
          background: #111827;
          color: var(--text);
          border: 1px solid var(--card-border);
          border-radius: 0.5rem;
          padding: 0.45rem 0.75rem;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
          }
          .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-hover));
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease;
          }
          .btn-primary:hover { opacity: 0.9; }

          /* 2-Column Responsive Layout */
          .layout {
          max-width: 1140px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2.5rem;
          }

          /* Sidebar */
          .sidebar {
          position: sticky;
          top: 5rem;
          height: fit-content;
          }
          .brand-logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary), var(--accent-blue));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 1.2rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 10px 20px -5px rgba(20, 184, 166, 0.3);
          }
          .feed-title {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
          }
          .feed-desc {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          }
          .info-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 1rem;
          padding: 1.25rem;
          text-align: center;
          }
          .info-card h4 { margin: 0 0 0.25rem 0; font-size: 0.875rem; color: var(--text); }
          .info-card p { margin: 0; font-size: 0.8rem; color: var(--text-muted); }

          /* Feed Article List */
          .feed-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          }
          .article-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: border-color 0.2s ease, transform 0.2s ease;
          }
          .article-card:hover {
          border-color: rgba(20, 184, 166, 0.4);
          transform: translateY(-2px);
          }
          .article-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary);
          margin-bottom: 0.5rem;
          }
          .article-meta span.date {
          color: var(--text-muted);
          font-weight: 400;
          }
          .article-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 700;
          }
          .article-title a {
          color: var(--text);
          text-decoration: none;
          }
          .article-title a:hover {
          color: var(--primary);
          }
          .article-excerpt {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
          }

          @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .sidebar { position: static; }
          .top-bar { flex-direction: column; align-items: flex-start; }
          .top-bar-controls { width: 100%; justify-content: space-between; }
          }
        </style>
      </head>
      <body>
        <!-- STICKY TOP BAR (CLOUDFLARE STYLE) -->
        <header class="top-bar">
          <div class="top-bar-brand">
            <span>📡 RSS Feed</span>
          </div>
          <div class="top-bar-controls">
            <span style="font-size: 0.85rem; color: var(--text-muted);">Follow with:</span>
            <select id="feedReaderSelect" class="reader-select">
              <option value="feedly">Feedly</option>
              <option value="inoreader">Inoreader</option>
              <option value="feedbin">Feedbin</option>
              <option value="netnewswire">NetNewsWire / Native</option>
            </select>
            <button class="btn-primary" onclick="subscribeToFeed()">+ Follow</button>
          </div>
        </header>

        <!-- MAIN LAYOUT -->
        <div class="layout">
          <!-- LEFT SIDEBAR -->
          <aside class="sidebar">
            <div class="brand-logo">
              <img src="/nodewave.svg" alt="NodeWave Logo"/>
            </div>
            <h1 class="feed-title"><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="feed-desc"><xsl:value-of select="/rss/channel/description"/></p>
            <img src="/nodewave.svg" alt="NodeWave Logo"/>
            <div class="info-card">
              <h4>What is an RSS Feed?</h4>
              <p>Subscribe by copying this page URL into your favorite RSS feed reader to receive auto-updates whenever new content is published.</p>
            </div>
          </aside>

          <!-- RIGHT ARTICLE LIST -->
          <main class="feed-list">
            <xsl:for-each select="/rss/channel/item">
              <article class="article-card">
                <div class="article-meta">
                  <span>POST</span> •
                  <span class="date"><xsl:value-of select="pubDate"/></span>
                </div>
                <h2 class="article-title">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h2>
                <p class="article-excerpt">
                  <xsl:value-of select="description" disable-output-escaping="yes"/>
                </p>
              </article>
            </xsl:for-each>
          </main>
        </div>

        <script>
          function subscribeToFeed() {
          const feedUrl = encodeURIComponent(window.location.href);
          const selected = document.getElementById('feedReaderSelect').value;
          let targetUrl = '';

          switch (selected) {
          case 'feedly':
          targetUrl = 'https://feedly.com/i/subscription/feed/' + feedUrl;
          break;
          case 'inoreader':
          targetUrl = 'https://www.inoreader.com/feed/' + feedUrl;
          break;
          case 'feedbin':
          targetUrl = 'https://feedbin.com/?subscribe=' + feedUrl;
          break;
          case 'netnewswire':
          targetUrl = 'feed:' + window.location.href;
          break;
          }

          if (targetUrl) {
          window.open(targetUrl, '_blank');
          }
          }
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
