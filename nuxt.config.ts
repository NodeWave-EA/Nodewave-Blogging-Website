/* eslint-disable node/no-process-env */
import { siteConfig } from "./app/app.meta";

const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || "https://nodewaveblog.vercel.app").replace(/\/$/, "");
const SITE_NAME = process.env.NUXT_PUBLIC_SITE_NAME || siteConfig.name || "NodeWave";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/content",
    "@comark/vue",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxtjs/seo",
    "@nuxt/scripts",
    "nuxt-aos",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/a11y",
    "@nuxtjs/device",
    "nuxt-ai-ready",
    "nuxt-studio",
    "nuxt-security",
  ],

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  app: {
    buildAssetsDir: "/_nuxt/",
    head: {
      meta: [
        { name: "color-scheme", content: "light dark" },
        { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#14b8a6" },
        { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0d9488" },
        { name: "theme-color", content: "#14b8a6" },
        { name: "msapplication-TileColor", content: "#14b8a6" },
        { name: "msapplication-TileImage", content: "/icons/web-app-manifest-192x192.png" },
        { name: "msapplication-config", content: "/icons/browserconfig.xml" },
        { name: "publisher", content: SITE_NAME },
        { name: "creator", content: SITE_NAME },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: "NodeWave Blogs" },
        { name: "application-name", content: "NodeWave Blogs" },
        {
          name: "google-site-verification",
          content: "5OvApnB9CWkAPirNZDUuxZVEmi9r2xTH4GrP8Om-mz0",
        },
        {
          name: "msvalidate.01",
          content: "314E0232A9FA1A5018E58CF771C23959",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          sizes: "48x48",
          href: "/icons/favicon.ico",
        },
        {
          rel: "icon",
          type: "image/svg+xml",
          sizes: "any",
          href: "/icons/favicon.svg",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/icons/favicon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "96x96",
          href: "/icons/favicon-96x96.png",
        },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
        { rel: "mask-icon", href: "/icons/favicon.svg", color: "#14b8a6" },
        { rel: "manifest", href: "/icons/manifest.json" },
      ],
    },
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in",
    },
  },

  css: [
    "~/assets/css/main.css",
    "katex/dist/katex.min.css",
  ],

  router: {
    options: { scrollBehaviorType: "smooth" },
  },

  site: {
    name: SITE_NAME,
    url: SITE_URL,
    description: siteConfig.description,
    defaultLocale: "en-US",
    trailingSlash: false,
  },

  colorMode: {
    preference: "system",
    fallback: "dark",
  },

  content: {
    build: {
      markdown: {
        toc: {
          depth: 5,
          searchDepth: 5,
        },
        highlight: {
          theme: { default: "github-light", dark: "github-dark" },
          langs: [
            "js",
            "ts",
            "rust",
            "go",
            "bash",
            "yaml",
            "log",
            "cpp",
            "json",
          ],
        },
        remarkPlugins: {
          "remark-reading-time": {},
          "remark-math": {},
          "remark-gfm": {},
          "@akebifiky/remark-simple-plantuml": { baseUrl: "https://plantuml.com" },
        },
        rehypePlugins: {
          "rehype-katex": {},
          "rehype-external-links": {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
          },
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
      siteName: SITE_NAME,
      siteDescription: siteConfig.description,
      siteLogo: `${SITE_URL}/logo.png`,
      logLevel: process.env.NUXT_PUBLIC_LOG_LEVEL || "log",
    },
  },

  build: {
    transpile: ["unist-util-visit", "unist-util-is"],
  },

  routeRules: {
    // Static Content Prerender Rules
    "/": { prerender: true },
    "/blogs": { prerender: true },
    "/blogs/**": { prerender: true },
    "/authors": { prerender: true },
    "/authors/**": { prerender: true },
    "/tags": { prerender: true },
    "/tags/**": { prerender: true },
    "/categories": { prerender: true },
    "/categories/**": { prerender: true },

    // RSS Feed Prerender Rules
    "/rss.xml": { prerender: true },
    "/blogs/rss.xml": { prerender: true },
    "/authors/rss.xml": { prerender: true },
    "/categories/rss.xml": { prerender: true },
    "/tags/rss.xml": { prerender: true },

    // Interactive / Private Routes (Client-side rendering & excluded from SEO indexing)
    "/search": {
      ssr: false,
      robots: "noindex, follow",
    },
    "/editor": { ssr: false, robots: false },
    "/editor/**": { ssr: false, robots: false },
    "/__nuxt_studio/**": { ssr: true },

    // Cross-Site API Bridge
    "/api/featured-posts": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    },

    // Static Assets Caching
    "/_nuxt/**": {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  },

  experimental: {
    emitRouteChunkError: "automatic-immediate",
    appManifest: true,
  },

  compatibilityDate: "2025-01-15",

  nitro: {
    future: {
      nativeSWR: true,
    },
    prerender: {
      crawlLinks: true,
      ignore: [
        "/__nuxt_studio",
        "/_vercel",
        "/search",
        "/editor",
      ],
    },
    experimental: {
      wasm: true,
    },
    routeRules: {
      "/_nuxt/**": {
        cache: { maxAge: 31536000 },
      },
      "/_og/**": {
        ssr: true,
        cache: false,
        headers: {
          "cache-control": "no-store",
          "x-forwarded-host": "true",
        },
      },
    },
    vercel: {
      config: {
        images: {
          sizes: [320, 640, 768, 1024, 1280, 1536],
        },
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "unist-util-is",
        "@unhead/schema-org/vue",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "unist-util-visit",
        "@comark/vue",
      ],
    },
  },

  aiReady: {
    autoI18n: false,
    cron: true,
    runtimeSync: {
      ttl: 3600,
      batchSize: 20,
      pruneTtl: 0,
    },
  },

  aos: {
    disable: false,
    startEvent: "DOMContentLoaded",
    initClassName: "aos-init",
    animatedClassName: "aos-animate",
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: 99,
    offset: 120,
    delay: 0,
    duration: 450,
    easing: "ease-out-cubic",
    once: false,
    mirror: false,
    anchorPlacement: "top-bottom",
  },

  eslint: {
    config: {
      standalone: false,
      stylistic: {
        semi: true,
        quotes: "double",
        indent: "tab",
        commaDangle: "always-multiline",
        braceStyle: "1tbs",
      },
    },
  },

  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
    },

    families: [
      {
        name: "Plus Jakarta Sans",
        weights: [400, 500, 600, 700],
        global: true,
      },
      {
        name: "Inter",
        weights: [400, 500, 600, 700],
        global: true,
      },
      {
        name: "Newsreader",
        weights: [400, 600, 700],
        styles: ["normal", "italic"],
        global: true,
      },
      {
        name: "Playfair Display",
        weights: [400, 700],
        global: true,
      },
      {
        name: "Lora",
        weights: [400, 500, 600],
        global: true,
      },
      {
        name: "EB Garamond",
        weights: [400, 500, 700],
        global: true,
      },
      {
        name: "JetBrains Mono",
        weights: [400, 500, 700],
        global: true,
      },
      {
        name: "IBM Plex Mono",
        weights: [400, 500],
        global: true,
      },
      {
        name: "Poppins",
        weights: [400, 500, 600, 700],
      },
      {
        name: "Roboto",
        weights: [300, 400, 500, 700, 900],
        global: true,
      },
      {
        name: "Special Elite",
        weights: [400],
        global: true,
      },
    ],

    processCSSVariables: true,
  },

  icon: {
    size: "1.2em",
    class: "icon",
    serverBundle: "local",
    fetchTimeout: 4000,
    clientBundle: {
      scan: true,
    },
  },

  image: {
    quality: 80,
    format: ["webp", "avif"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  linkChecker: {
    enabled: true,
    failOnError: false,
    fetchRemoteUrls: process.env.NODE_ENV === "production",
    strictNuxtContentPaths: true,
    showLiveInspections: true,
    debug: process.env.NUXT_PUBLIC_LOG_LEVEL === "debug",
    runOnBuild: true,
    fetchTimeout: 10000,
    report: {
      publish: true,
      html: true,
    },
  },

  ogImage: {
    enabled: true,
    defaults: {
      width: 1200,
      height: 630,
      extension: "png",
    },
    security: {
      strict: true,
    },
    debug: process.env.NODE_ENV === "development" && process.env.NUXT_PUBLIC_LOG_LEVEL === "debug",
  },

  robots: {
    enabled: true,
    debug: process.env.NODE_ENV === "development" && process.env.NUXT_PUBLIC_LOG_LEVEL === "debug",
    disallow: ["/search", "/editor", "/api/"],
    sitemap: ["/sitemap.xml"],
    groups: [
      {
        userAgent: "*",
        allow: "/",
        contentUsage: {
          "bots": "y",
          "train-ai": "y",
          "ai-output": "y",
          "search": "y",
        },
        contentSignal: {
          "search": "yes",
          "ai-input": "yes",
          "ai-train": "yes",
        },
      },
    ],
  },

  schemaOrg: {
    identity: {
      type: "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
  },

  security: {
    headers: {
      strictTransportSecurity: {
        maxAge: 63072000, // 2 years
        includeSubdomains: true,
        preload: true,
      },
      xContentTypeOptions: "nosniff",
      contentSecurityPolicy: {
        "default-src": ["'self'"],
        "base-uri": ["'self'"],
        "font-src": ["'self'", "https:", "data:"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
        "img-src": ["'self'", "data:", "https:"],
        "object-src": ["'none'"],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "script-src": [
          "'self'",
          "https:",
          "'unsafe-inline'",
          "https://translate.google.com",
          "https://translate.googleapis.com",
          "https://www.gstatic.com",
        ],
        "connect-src": [
          "'self'",
          "https://translate.googleapis.com",
        ],
        "upgrade-insecure-requests": true,
        "frame-src": [
          "'self'",
          "https://translate.google.com",
          "https://translate.googleapis.com",
        ],
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      xFrameOptions: "DENY",
    },
  },

  seo: {
    debug: process.env.NODE_ENV === "development" && process.env.NUXT_PUBLIC_LOG_LEVEL === "debug",
    fallbackTitle: false,
    redirectToCanonicalSiteUrl: process.env.NODE_ENV === "production",
  },

  sitemap: {
    zeroRuntime: true,
    autoI18n: false,
    discoverImages: true,
    exclude: [
      "/search",
      "/search/**",
      "/editor",
      "/editor/**",
      "/_og/**",
      "/api/**",
      "/_nuxt/**",
      "/__nuxt_content/**",
    ],
    debug: process.env.NUXT_PUBLIC_LOG_LEVEL === "debug",
  },

  studio: {
    dev: false,
    route: "/editor",
    git: {
      commit: {
        messagePrefix: "content update:",
      },
    },
    repository: {
      provider: "github",
      owner: "Nodewave-EA",
      repo: "Nodewave-Blogging-Website",
      branch: "main",
    },
  },
});
