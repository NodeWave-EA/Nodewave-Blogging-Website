<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> (RSS Feed)</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          /* NodeWave Sepia Paper Theme Variables */
          :root {
          /* Light Mode Sepia Baseline (#f4efe6 base) */
          --bg: #f4efe6;
          --card-bg: rgba(255, 255, 255, 0.65);
          --card-border: rgba(224, 218, 208, 0.8);
          --card-border-hover: rgba(13, 148, 136, 0.4);
          --text: #23201b;
          --text-muted: #6e675e;
          --primary: #0d9488;
          --primary-hover: #0f766e;
          --code-bg: #e8e2d5;
          --topbar-bg: rgba(244, 239, 230, 0.85);
          --input-bg: #eae3d5;
          --heading-color: #1a1815;
          --vignette: radial-gradient(circle at center, transparent 30%, rgba(120,53,15,0.05) 100%);
          --dot-opacity: 0.03;
          }

          @media (prefers-color-scheme: dark) {
          :root {
          /* Dark Mode Sepia Baseline (#181614 base) */
          --bg: #181614;
          --card-bg: rgba(28, 26, 23, 0.7);
          --card-border: rgba(255, 255, 255, 0.08);
          --card-border-hover: rgba(20, 184, 166, 0.4);
          --text: #f4efe6;
          --text-muted: #9a9388;
          --primary: #14b8a6;
          --primary-hover: #0d9488;
          --code-bg: #22201c;
          --topbar-bg: rgba(24, 22, 20, 0.85);
          --input-bg: #22201c;
          --heading-color: #ffffff;
          --vignette: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%);
          --dot-opacity: 0.08;
          }
          }

          * {
          box-sizing: border-box;
          }

          body {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: var(--bg);
          color: var(--text);
          margin: 0;
          padding: 0;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          position: relative;
          min-height: 100vh;
          }

          /* BACKGROUND TEXTURE CONTAINER */
          .site-background {
          position: fixed;
          inset: 0;
          z-index: -50;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          user-select: none;
          background-color: var(--bg);
          transition: background-color 0.7s ease;
          }

          .paper-grain {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transition: opacity 0.3s ease;
          }

          .light-grain {
          mix-blend-mode: multiply;
          opacity: 1.0;
          display: block;
          }

          .dark-grain {
          mix-blend-mode: soft-light;
          opacity: 1.6;
          display: none;
          }

          @media (prefers-color-scheme: dark) {
          .light-grain { display: none; }
          .dark-grain { display: block; }
          }

          .paper-dots {
          position: absolute;
          inset: 0;
          opacity: var(--dot-opacity);
          pointer-events: none;
          mix-blend-mode: overlay;
          background-image: radial-gradient(circle at 50% 50%, rgba(160, 150, 130, 0.6) 1px, transparent 1px);
          background-size: 12px 12px;
          }

          .paper-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: var(--vignette);
          }

          .ambient-glow {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
          }

          .glow-top {
          top: -10%;
          left: -5%;
          width: 45vw;
          height: 45vw;
          max-width: 560px;
          background: rgba(245, 158, 11, 0.05);
          filter: blur(120px);
          }

          .glow-bottom {
          bottom: -10%;
          right: -5%;
          width: 50vw;
          height: 50vw;
          max-width: 600px;
          background: rgba(20, 184, 166, 0.07);
          filter: blur(130px);
          }

          /* Responsive Images */
          img {
          max-width: 100%;
          height: auto;
          display: block;
          }

          /* Sticky Header Bar */
          .top-bar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--topbar-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--card-border);
          padding: 0.75rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          }

          .top-bar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          }

          .top-bar-brand img {
          height: 22px;
          width: auto;
          }

          .top-bar-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          }

          .reader-select {
          background: var(--input-bg);
          color: var(--text);
          border: 1px solid var(--card-border);
          border-radius: 0.5rem;
          padding: 0.45rem 0.75rem;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease;
          }

          .reader-select:focus {
          border-color: var(--primary);
          }

          .btn-primary {
          background: var(--primary);
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          }

          .btn-primary:hover {
          background-color: var(--primary-hover);
          }

          /* Layout Container */
          .layout {
          max-width: 1140px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          }

          /* Sidebar Section */
          .sidebar {
          position: sticky;
          top: 5rem;
          height: fit-content;
          }

          .brand-logo {
          display: flex;
          align-items: center;
          margin-bottom: 1.25rem;
          }

          .brand-logo img {
          height: 44px;
          width: auto;
          object-fit: contain;
          }

          .feed-title {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
          color: var(--heading-color);
          line-height: 1.3;
          }

          .feed-desc {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 1.75rem;
          line-height: 1.5;
          }

          .info-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(8px);
          border-radius: 0.875rem;
          padding: 1.25rem;
          }

          .info-card h4 {
          margin: 0 0 0.4rem 0;
          font-size: 0.85rem;
          color: var(--text);
          font-weight: 600;
          }

          .info-card p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.45;
          }

          /* Article Feed List */
          .feed-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          }

          .article-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(8px);
          border-radius: 0.875rem;
          padding: 1.5rem;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          }

          .article-card:hover {
          border-color: var(--card-border-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
          }

          .article-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--primary);
          margin-bottom: 0.5rem;
          }

          .article-meta span.date {
          color: var(--text-muted);
          font-weight: 400;
          }

          .article-title {
          margin: 0 0 0.6rem 0;
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.4;
          }

          .article-title a {
          color: var(--heading-color);
          text-decoration: none;
          transition: color 0.15s ease;
          }

          .article-title a:hover {
          color: var(--primary);
          }

          .article-excerpt {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          overflow-wrap: break-word;
          }

          .article-excerpt code {
          background: var(--code-bg);
          color: var(--primary);
          padding: 0.15rem 0.35rem;
          border-radius: 0.25rem;
          font-size: 0.825em;
          }

          .article-excerpt img {
          border-radius: 0.5rem;
          margin: 0.75rem 0;
          }

          /* Responsive Breakpoint */
          @media (max-width: 768px) {
          .layout {
          grid-template-columns: 1fr;
          gap: 2rem;
          padding: 1.5rem 1rem;
          }

          .sidebar {
          position: static;
          }

          .top-bar {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          }

          .top-bar-controls {
          width: 100%;
          justify-content: space-between;
          }
          }
        </style>
      </head>
      <body>
        <!-- TACTILE PARCHMENT PAPER BACKGROUND OVERLAY -->
        <div class="site-background" aria-hidden="true">
          <!-- Light Mode Grain (Opacity 1.0) -->
          <svg class="paper-grain light-grain">
            <filter id="paper-grain-light">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="4"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="
                  0.3 0 0 0 0.4
                  0 0.3 0 0 0.35
                  0 0 0.3 0 0.3
                  0 0 0 0.7 0"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#paper-grain-light)"/>
          </svg>

          <!-- Dark Mode Fiber Texture (Opacity 1.6) -->
          <svg class="paper-grain dark-grain">
            <filter id="paper-grain-dark">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.7"
                numOctaves="4"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.85 0"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#paper-grain-dark)"/>
          </svg>

          <!-- Micro Paper Fiber Dot Pattern -->
          <div class="paper-dots"/>

          <!-- Vignette Gradient -->
          <div class="paper-vignette"/>

          <!-- Subtle Ambient Glows -->
          <div class="ambient-glow glow-top"/>
          <div class="ambient-glow glow-bottom"/>
        </div>

        <!-- STICKY HEADER BAR -->
        <header class="top-bar">
          <div class="top-bar-brand">
            <img src="/nodewave.svg" alt="NodeWave Logo"/>
            <span>RSS FEED</span>
          </div>
          <div class="top-bar-controls">
            <span style="font-size: 0.825rem; color: var(--text-muted);">Follow with:</span>
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

            <div class="info-card">
              <h4>What is an RSS Feed?</h4>
              <p>Subscribe by copying this page URL into your favorite feed reader to receive automated updates whenever new articles are published.</p>
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
                <div class="article-excerpt">
                  <xsl:value-of select="description" disable-output-escaping="yes"/>
                </div>
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
