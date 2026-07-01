<script setup lang="ts">
import { defineOrganization, defineWebSite, useSchemaOrg } from "#imports";

import { siteConfig } from "~/app.meta";

const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl;
const siteName = config.public.siteName;
const siteLogo = config.public.siteLogo;

const ROOT_URL = siteUrl;
const ORG_ID = `${ROOT_URL}/#organization`;
const WEBSITE_ID = `${ROOT_URL}/#website`;
const LOCAL_BIZ_ID = `${ROOT_URL}/#local-business`;

useSchemaOrg([
  defineWebSite({
    "@id": WEBSITE_ID,
    "url": ROOT_URL,
    "name": siteName,
    "description": siteConfig.description,
    "publisher": { "@id": ORG_ID },
    "inLanguage": "en-US",
  }),

  defineOrganization({
    "@id": ORG_ID,
    "url": ROOT_URL,
    "name": siteName,
    "legalName": siteName,
    "description": siteConfig.description,
    "logo": siteLogo,
    "image": siteLogo,
    "foundingDate": "2024",
    "email": siteConfig.contact.email,
    "telephone": siteConfig.contact.phone,
    "areaServed": ["KE", "EA"],
    "sameAs": [
      siteConfig.social?.github,
      siteConfig.social?.tiktok,
    ].filter(Boolean),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": siteConfig.postAddress?.streetAddress || "",
      "addressLocality": siteConfig.postAddress?.locality || "",
      "addressRegion": siteConfig.postAddress?.addressRegion || "",
      "postalCode": siteConfig.postAddress?.postalCode || "",
      "addressCountry": siteConfig.postAddress?.addressCountry || "KE",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": siteConfig.contact.email,
      "telephone": siteConfig.contact.phone,
      "areaServed": "EA",
      "availableLanguage": ["English"],
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 10,
      "maxValue": 50,
      "unitText": "employees",
    },
  }),

  {
    "@type": "LocalBusiness",
    "@id": LOCAL_BIZ_ID,
    "name": siteName,
    "image": siteLogo,
    "url": ROOT_URL,
    "department": "Technology",
    "description": siteConfig.description,
    "telephone": siteConfig.contact.phone,
    "email": siteConfig.contact.email,
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": siteConfig.postAddress?.streetAddress || "",
      "addressLocality": siteConfig.postAddress?.locality || "",
      "addressRegion": siteConfig.postAddress?.addressRegion || "",
      "postalCode": siteConfig.postAddress?.postalCode || "",
      "addressCountry": siteConfig.postAddress?.addressCountry || "KE",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-1.2832",
      "longitude": "36.8172",
    },
    "aggregateRating": {
      "author": {
        "@type": "Organization",
        "name": siteName,
        "url": ROOT_URL,
        "logo": siteLogo,
        "email": siteConfig.contact.email,
        "telephone": siteConfig.contact.phone,
        "sameAs": [
          siteConfig.social?.github,
          siteConfig.social?.tiktok,
        ].filter(Boolean),
        "description": siteConfig.description,
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Support",
          "email": siteConfig.contact.email,
          "telephone": siteConfig.contact.phone,
          "areaServed": "EA",
          "availableLanguage": ["English"],
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": siteConfig.postAddress?.streetAddress || "",
          "addressLocality": siteConfig.postAddress?.locality || "",
          "addressRegion": siteConfig.postAddress?.addressRegion || "",
          "postalCode": siteConfig.postAddress?.postalCode || "",
          "addressCountry": siteConfig.postAddress?.addressCountry || "KE",
        },
      },
      "@type": "AggregateRating",
      "itemReviewed": {
        "@id": LOCAL_BIZ_ID,
      },
      "bestRating": "5",
      "worstRating": "3",
      "ratingCount": "24",
      "ratingValue": "4.8",
      "reviewCount": "24",
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Michael Kamau",
          "url": "https://www.linkedin.com/in/michael-ngugi-50ba66177",
          "image":
            "https://media.licdn.com/dms/image/v2/D4D03AQE7HKkXViVqLA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1702225972216?e=1780531200&v=beta&t=rwvArvKV2zjktqYkvouDvjTpwIUo0ruLht4hLeVSls0",
          "sameAs": ["https://www.linkedin.com/in/michael-ngugi-50ba66177"],
          "jobTitle": "Operations Manager",
          "worksFor": "Solareon Energy",
        },
        "datePublished": "2026-03-10",
        "reviewBody":
          "Excellent enterprise IoT telemetry integration systems and custom analytical dashboard solutions setup.",
        "itemReviewed": {
          "@id": LOCAL_BIZ_ID,
        },
        "reviewRating": {
          "@type": "Rating",
          "bestRating": "5",
          "ratingValue": "5",
          "worstRating": "1",
        },
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Organization",
          "name": "Solareon Energy",
          "logo": "https://solareonenergy.com/logo.png",
          "image": "https://solareonenergy.com/logo.png",
          "url": "https://solareonenergy.com",
          "email": "info@solareonenergy.com",
          "telephone": "+254 722873777",
          "sameAs": ["https://solareonenergy.com/#"],
          "description":
            "Leading provider of solar energy solutions in East Africa, specializing in residential and commercial solar panel installations.",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "email": "info@solareonenergy.com",
            "telephone": "+254 722873777",
            "areaServed": "EA",
            "availableLanguage": ["English"],
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Nairobi",
            "addressLocality": "Nairobi",
            "addressRegion": "Nairobi County",
            "postalCode": "00100",
            "addressCountry": "KE",
          },
        },
        "datePublished": "2026-02-15",
        "reviewBody":
          "Professional and efficient service with great attention to detail in IoT solutions deployment.",
        "itemReviewed": {
          "@id": LOCAL_BIZ_ID,
        },
        "reviewRating": {
          "@type": "Rating",
          "bestRating": "5",
          "ratingValue": "4",
          "worstRating": "1",
        },
      },
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "16:00",
      },
    ],
  },
]);
</script>

<template>
  <slot />
</template>
