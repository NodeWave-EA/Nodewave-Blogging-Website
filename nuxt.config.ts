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
  content: {
    experimental: {
      sqliteConnector: "native",
    },
    build: {
      markdown: {
        toc: {
          depth: 5,
          searchDepth: 5,
        },
        remarkPlugins: {
          "remark-toc": {
            options: {
              heading: "Table of Contents",
            },
          },
          "remark-reading-time": {},
          "remark-emoji": {
            options: { emoticon: true },
          },
          "remark-lint": {
            options: {
              "no-duplicate-headings": true,
              "no-empty-url": true,
              "no-file-name-articles": true,
              "no-file-name-consecutive-dashes": true,
              "no-file-name-mixed-case": true,
              "no-file-name-snake-case": true,
              "no-heading-punctuation": true,
              "no-inline-padding": true,
              "no-missing-blank-lines": true,
              "no-multiple-toplevel-headings": true,
              "no-reference-like-url": true,
              "no-space-in-links": true,
              "no-tabs-indentation": true,
            },
          },
          "remark-github-blockquote-alert": {},
          "remark-github": {},
          "remark-gfm": {},
          "remark-git-contributors": {},
          "@akebifiky/remark-simple-plantuml": {},
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

  routeRules: {
    "/": { prerender: true },
  },
  experimental: {},

  compatibilityDate: "2025-01-15",

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/rss.xml"],
    },
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

  linkChecker: {
    enabled: false,
  },
});
