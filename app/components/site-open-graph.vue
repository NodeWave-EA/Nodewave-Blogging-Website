<script setup lang="ts">
import {
  defineLocalBusiness,
  defineOrganization,
  defineWebSite,
  useRobotsRule,
  useSchemaOrg,
} from "#imports";
import { computed } from "vue";

import { siteConfig } from "~/app.meta";

const route = useRoute();
const config = useRuntimeConfig().public;
const colorMode = useColorMode();

const siteUrl = computed(() =>
  (config.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, ""),
);
const siteName = computed(() => config.siteName || siteConfig.name || "NodeWave");
const siteDescription = computed(
  () =>
    siteConfig.description
    || "Explore curated technical posts, IoT architecture guides, and software engineering insights from NodeWave.",
);

const siteLogo = computed(() => {
  const logo = config.siteLogo || "/logo.png";
  if (logo.startsWith("http"))
    return logo;
  const cleanPath = logo.startsWith("/")
    ? logo
    : `/${logo}`;
  return `${siteUrl.value}${cleanPath}`;
});

// Strip query strings & trailing slashes (except root "/") for clean canonical URLs
const canonicalUrl = computed(() => {
  const cleanPath = route.path === "/"
    ? "/"
    : route.path.replace(/\/$/, "");
  return `${siteUrl.value}${cleanPath}`;
});

const isSearchRoute = computed(() => route.path.startsWith("/search"));

const socialProfiles = computed(() =>
  [
    siteConfig.social?.github,
    siteConfig.social?.tiktok,
    ...(siteConfig.socialLinks?.map(link => link.url) || []),
  ].filter((url, idx, arr): url is string => Boolean(url) && arr.indexOf(url) === idx),
);

const ogColorMode = computed<"light" | "dark">(() =>
  colorMode.value === "light"
    ? "light"
    : "dark",
);

// Global <head> Attributes, Title Template, Canonical & Primary RSS Feed
useHead({
  htmlAttrs: {
    lang: "en-US",
  },
  titleTemplate: (titleChunk?: string) => {
    if (!titleChunk)
      return `${siteName.value} — Smart IoT Solutions & Engineering Insights`;
    return titleChunk.toLowerCase().includes(siteName.value.toLowerCase())
      ? titleChunk
      : `${titleChunk} · ${siteName.value}`;
  },
  link: [
    {
      rel: "canonical",
      href: () => canonicalUrl.value,
    },
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: () => `${siteName.value} RSS Feed`,
      href: () => `${siteUrl.value}/rss.xml`,
    },
  ],
});

// Site-Wide Open Graph, Twitter & Robots Defaults (overridden per page by useSeoMeta)
useSeoMeta({
  ogSiteName: () => siteName.value,
  ogLocale: "en_US",
  ogType: "website",
  ogUrl: () => canonicalUrl.value,
  twitterCard: "summary_large_image",
  robots: () =>
    isSearchRoute.value
      ? "noindex, follow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
});

const robotsRule = computed<boolean | string>(() =>
  isSearchRoute.value ? "noindex, follow" : true,
);

// Keep X-Robots-Tag HTTP header aligned with <meta name="robots">
useRobotsRule(robotsRule);

// Site-Wide Fallback OG Image (overridden whenever a page calls defineOgImage)
defineOgImage("NuxtSeo.takumi", {
  colorMode: ogColorMode.value,
  brand: siteName.value,
  tagline: "Smart IoT Solutions",
  badge: "Engineering & Insights",
  siteUrl: siteUrl.value,
  title: `${siteName.value} - Curated Posts & Engineering Insights`,
  description: siteDescription.value,
});

// Connected Knowledge Graph Entities (WebSite -> Organization -> LocalBusiness)
const ORG_ID = `${siteUrl.value}/#organization`;
const WEBSITE_ID = `${siteUrl.value}/#website`;
const LOCAL_BIZ_ID = `${siteUrl.value}/#local-business`;

const sharedAddress = {
  "@type": "PostalAddress" as const,
  "streetAddress": siteConfig.postAddress?.streetAddress || "Nairobi",
  "addressLocality": siteConfig.postAddress?.locality || "Nairobi",
  "addressRegion": siteConfig.postAddress?.addressRegion || "Nairobi County",
  "postalCode": siteConfig.postAddress?.postalCode || "00100",
  "addressCountry": siteConfig.postAddress?.addressCountry || "KE",
};

useSchemaOrg([
  defineWebSite({
    "@id": WEBSITE_ID,
    "url": siteUrl.value,
    "name": siteName.value,
    "description": siteDescription.value,
    "publisher": { "@id": ORG_ID },
    "inLanguage": "en-US",
  }),

  defineOrganization({
    "@id": ORG_ID,
    "url": siteUrl.value,
    "name": siteName.value,
    "legalName": siteName.value,
    "description": siteDescription.value,
    "logo": siteLogo.value,
    "image": siteLogo.value,
    "foundingDate": "2024",
    "email": siteConfig.contact?.email,
    "telephone": siteConfig.contact?.phone,
    "areaServed": ["KE", "EA"],
    "sameAs": socialProfiles.value,
    "address": sharedAddress,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": siteConfig.contact?.email,
      "telephone": siteConfig.contact?.phone,
      "areaServed": "EA",
      "availableLanguage": ["English"],
    },
  }),

  defineLocalBusiness({
    "@id": LOCAL_BIZ_ID,
    "name": siteName.value,
    "image": siteLogo.value,
    "url": siteUrl.value,
    "description": siteDescription.value,
    "telephone": siteConfig.contact?.phone,
    "email": siteConfig.contact?.email,
    "priceRange": "$$$",
    "parentOrganization": { "@id": ORG_ID },
    "areaServed": ["KE", "EA"],
    "address": sharedAddress,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -1.2832,
      "longitude": 36.8172,
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        "opens": "09:00",
        "closes": "16:00",
      },
    ],
  }),
]);
</script>

<template>
  <slot />
</template>
