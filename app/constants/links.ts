import { siteConfig } from "~/app.meta";

import type { Link } from "~/types";

export type FooterLinkGroup = {
  title: string;
  links: Array<Link & { external?: boolean }>;
};

export const navLinks: Link[] = [
  {
    label: "Home",
    to: "/",
    icon: "i-line-md-home",
  },
  {
    label: "blogs",
    to: "/blogs",
    icon: "i-lucide-files",
  },
  {
    label: "authors",
    to: "/authors",
    icon: "i-lucide-users",
  },
  {
    label: "categories",
    to: "/categories",
    icon: "i-lucide-folder-tree",
  },
  {
    label: "tags",
    to: "/tags",
    icon: "i-lucide-tags",
  },
  {
    label: "search",
    to: "/search",
    icon: "i-line-md-search",
  },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Navigation",
    links: [
      {
        label: "Home",
        to: "/",
        icon: "i-line-md-home",
      },
      {
        label: "Articles",
        to: "/blogs",
        icon: "i-lucide-files",
      },
      {
        label: "Global Search",
        to: "/search",
        icon: "i-line-md-search",
      },
    ],
  },
  {
    title: "Directory",
    links: [
      {
        label: "Categories",
        to: "/categories",
        icon: "i-lucide-folder-tree",
      },
      {
        label: "Topic Tags",
        to: "/tags",
        icon: "i-lucide-tags",
      },
      {
        label: "Authors",
        to: "/authors",
        icon: "i-lucide-users",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "RSS Feed",
        to: "/rss.xml",
        icon: "i-lucide-rss",
        external: true,
      },
      {
        label: "GitHub",
        to: siteConfig.social.github,
        icon: "i-line-md-github-loop",
        external: true,
      },
      // Nuxt Studio
      {
        label: "Editor",
        to: "/editor",
        icon: "i-line-md-edit",
      },
    ],
  },
];

export const socialLinks: Link[] = [
  {
    label: "GitHub",
    to: siteConfig.social.github,
    icon: "i-line-md-github-loop",
  },
];
