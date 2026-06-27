import { siteConfig } from "~/app.meta";

import type { Link } from "~/types";

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

export const socialLinks: Link[] = [
  {
    label: "GitHub",
    to: siteConfig.social.github,
    icon: "i-line-md-github-loop",
  },
  {
    label: "Feed",
    to: "/rss.xml",
    icon: "i-line-md-rss",
  },
];
