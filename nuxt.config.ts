/* eslint-disable node/no-process-env */
import { siteConfig } from "./app/app.meta";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/content",
    "@comark/nuxt",
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
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      titleTemplate: "%s | NodeWave",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#14b8a6" },
        { name: "msapplication-TileColor", content: "#14b8a6" },
        {
          name: "msapplication-TileImage",
          content: "/web-app-manifest-192x192.png",
        },
        { name: "application-name", content: "NodeWave" },
        { name: "apple-mobile-web-app-title", content: "NodeWave" },
      ],
      link: [
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS Feed for Nodewave Blog",
          href: `${process.env.NUXT_PUBLIC_SITE_URL}/rss.xml`,
        },
        { rel: "alternate", hreflang: "en", href: `${process.env.NUXT_PUBLIC_SITE_URL}` },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "96x96",
          href: "/favicon-96x96.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "192x192",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/manifest.json" },
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

  css: ["~/assets/css/main.css"],

  router: {
    options: { scrollBehaviorType: "smooth" },
  },

  site: {
    name: siteConfig.name,
    url: process.env.NUXT_PUBLIC_SITE_URL,
    defaultLocale: "en",
    trailingSlash: false,
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 5,
          searchDepth: 5,
        },
        remarkPlugins: {
          "remark-reading-time": {},
          // "remark-toc": {
          //   options: {
          //     heading: "Table of Contents",
          //   },
          // },
          // "remark-emoji": {
          //   options: { emoticon: true },
          // },
          // "remark-lint": {
          //   options: {
          //     "no-duplicate-headings": true,
          //     "no-empty-url": true,
          //     "no-file-name-articles": true,
          //     "no-file-name-consecutive-dashes": true,
          //     "no-file-name-mixed-case": true,
          //     "no-file-name-snake-case": true,
          //     "no-heading-punctuation": true,
          //     "no-inline-padding": true,
          //     "no-missing-blank-lines": true,
          //     "no-multiple-toplevel-headings": true,
          //     "no-reference-like-url": true,
          //     "no-space-in-links": true,
          //     "no-tabs-indentation": true,
          //   },
          // },
          // "remark-github-blockquote-alert": {},
          // "remark-github": {},
          // "remark-gfm": {},
          // "remark-git-contributors": {},
          // "@akebifiky/remark-simple-plantuml": {},
          // 'remark-refer-plantuml': {},
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      siteName: siteConfig.name,
      siteDescription: siteConfig.description,
      siteLogo: `${process.env.NUXT_PUBLIC_SITE_URL}/logo.png`,
      logLevel: process.env.NUXT_PUBLIC_LOG_LEVEL || "log",
    },
  },

  build: {
    // This forces Nuxt/Vite to correctly transpile the ESM module
    transpile: ["unist-util-visit", "unist-util-is"],
  },

  routeRules: {
    // Fully pre-rendered static assets
    "/": { prerender: true },

    // Client-Side Only (Bypass server caching for dynamic on-page searching)
    "/search": { ssr: false },

    // Stale-While-Revalidate (SWR) for Content & Feeds (Instant speeds like SSG)
    "/blogs": { swr: 3600 }, // Blog Index Page
    "/blogs/**": { swr: 3600 }, // Individual Blog Post Slugs ([slug].vue)

    "/authors": { swr: 3600 }, // Authors Index Page
    "/authors/**": { swr: 3600 }, // Author Profile Slugs

    "/tags": { swr: 3600 }, // Tags Index Page
    "/tags/**": { swr: 3600 }, // Tag Filtering Slugs

    "/categories": { swr: 3600 }, // Categories Index Page
    "/categories/**": { swr: 3600 }, // Category Filtering Slugs

    // Studio Module Engine (No server caching)
    // "/_studio/**": { ssr: false },
    "/editor/**": { ssr: false },
  },

  experimental: {
    emitRouteChunkError: "automatic-immediate",
  },

  compatibilityDate: "2025-01-15",

  nitro: {
    prerender: {
      crawlLinks: true,
      // Include your main entry points for the crawler
      routes: [
        "/", // The crawler will start here and find all internal links
        "/rss.xml", // Pre-renders your RSS feed statically
      ],
      // OPTIONAL: Protect your build by ignoring purely dynamic or broken routes
      ignore: [],
    },
    experimental: {
      wasm: true,
    },
    routeRules: {
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
      include: ["unist-util-visit"],
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
    duration: 450, // Balanced snappy entry velocity timing
    easing: "ease-out-cubic", // Fluid velocity transition curves
    once: false,
    mirror: false,
    anchorPlacement: "top-bottom",
  },

  comark: {},

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
      { name: "Plus Jakarta Sans", weights: [400, 500, 600, 700] },
      { name: "Inter", weights: [400, 500, 600, 700] },
      { name: "Newsreader", weights: [400, 600, 700], styles: ["normal", "italic"] },
      { name: "Playfair Display", weights: [400, 700] },
      { name: "Lora", weights: [400, 500, 600] },
      { name: "EB Garamond", weights: [400, 500, 700] },
      { name: "JetBrains Mono", weights: [400, 500, 700] },
      { name: "IBM Plex Mono", weights: [400, 500] },
      { name: "Poppins", weights: [400, 500, 600, 700] },
      { name: "Roboto", weights: [300, 400, 500, 700, 900] },
      { name: "Special Elite", weights: [400] },
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

  // High performance visual resolution transformation targets configuration
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
    failOnError: true,
    fetchRemoteUrls: true,
    strictNuxtContentPaths: true,
    showLiveInspections: true,
    debug: true,
    runOnBuild: true,
    fetchTimeout: 10000,
    report: {
      publish: true,
      html: true,
    },
  },

  ogImage: {
    enabled: true,
    componentDirs: ["components/OgImage"],
    security: {
      secret: process.env.NUXT_OG_IMAGE_SECRET,
    },
    debug: true,
  },

  robots: {
    enabled: true,
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

  sitemap: {
    autoI18n: true,
    zeroRuntime: true,
    discoverImages: true,
    exclude: ["/app/**", "/api/**", "/_nuxt/**", "/__nuxt_content/**"],
    debug: false,
  },

  studio: {
    route: "/editor",
    repository: {
      provider: "github",
      owner: "Nodewave-EA",
      repo: "Nodewave-Blogging-Website",
      branch: "main",
    },
  },
});
