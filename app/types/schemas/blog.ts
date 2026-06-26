import z from "zod";

import { authorSchema } from "./author";
import { categorySchema } from "./category";
import { mediaSchema } from "./media";
import { seoSchema } from "./seo";
import { tagSchema } from "./tag";

const anchorSchema = z.object({
  label: z.string().min(1, "Anchor label text must not be empty"),
  icon: z.string().describe("Icon identifier token string (e.g., i-heroicons-link)"),
  to: z.string()
    .url()
    .or(z.string().regex(/^\/.*/, "Relative paths must begin strictly with '/'")),
});

export const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens")
    .describe("Unique identifier for the blog post, used in URLs and references")
    .default("blog-slug"),
  description: z.string()
    .describe("type: text; Concise summary of the blog post content for SEO and social sharing")
    .default("Blog post description text"),
  excerpt: z.string()
    .describe("type: text; Short preview snippet of the blog post content for listings and teasers")
    .default("Blog post excerpt text"),
  date: z.coerce.date()
    .describe("Original creation or publication release timeline timestamp")
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")),
  updatedAt: z.coerce.date()
    .describe("Audit log trace capturing subsequent review revisions")
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")),
  draft: z.boolean()
    .default(true)
    .describe("When true, shields document visibility from production build routing channels"),
  published: z.boolean()
    .default(false)
    .describe("Express status state confirming public reader availability"),
  publishedAt: z.coerce.date()
    .describe("Explicit programmatic timestamp mapping for post syndication delivery schedules")
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")),
  featured: z.boolean()
    .default(false)
    .describe("Promote document instance to premium carousel structures"),
  coverImage: mediaSchema,
  gallery: z.array(mediaSchema).default([]),
  tags: z.array(tagSchema).default([]),
  categories: z.array(categorySchema).default([]),
  author: authorSchema,
  anchors: z.array(anchorSchema)
    .default([])
    .describe("Action buttons or quick reference jump links for callouts"),
  seo: seoSchema,
});

export type BlogPost = z.infer<typeof blogSchema>;

const _exampleBlog = {
  id: "blogs/blogs/powershell-bash.md",
  title: "Bash-ify Your PowerShell - The Ultimate Guide to Autosuggestions, Completions, and Subcommands",
  excerpt: "Learn how to make PowerShell look, feel, and behave exactly like a premium Bash/Zsh environment with autosuggestions, interactive subcommand completions, and fuzzy history search.",
  anchors: [],
  author: {
    id: "authors/authors/gideon-yebei.yml",
    title: "Software Engineer",
    active: true,
    avatar: [Object],
    company: null,
    description: "Gideon is a software engineer with a passion for building scalable web applications. With over 5 years of experience in the industry, he has worked on various projects ranging from startups to large enterprises. Gideon specializes in full-stack development and is proficient in technologies such as JavaScript, React, Node.js, and Python. In his free time, he enjoys contributing to open-source projects and exploring new technologies.",
    email: "yebei@nodewave.net",
    extension: "yml",
    featured: false,
    meta: {},
    name: "Gideon Yebei",
    role: "author",
    slug: "gideon-yebei",
    socialLinks: [Array],
    stem: "authors/gideon-yebei",
    website: "https://yebei-gideon.github.io",
    __hash__: "hVDXOGuGHClVtWJLPMVghucuSBBjtdsWjiYFnAp1g2s",
  },
  body: { type: "minimark", value: [Array], toc: [Object] },
  categories: [[Object]],
  coverImage: {
    src: "/blogs/posts/powershell-bash/cover.png",
    alt: "Stylized terminal window showing predictive text and interactive completion menus",
    caption: "Transform your PowerShell experience with modern shell features.",
  },
  date: "2026-06-16",
  description: "Learn how to make PowerShell look, feel, and behave exactly like a premium Bash/Zsh environment with autosuggestions, interactive subcommand completions, and fuzzy history search.",
  draft: false,
  extension: "md",
  featured: true,
  gallery: [[Object], [Object]],
  meta: { readingTime: [Object] },
  navigation: true,
  path: "/blogs/powershell-bash",
  published: true,
  publishedAt: "2026-06-16",
  seo: {
    title: "How to Make PowerShell Behave Like Bash/Zsh (2026 Guide)",
    description: "Step-by-step tutorial to configure pwsh with emacs keybindings, fish-style autocomplete, carapace subcommand popups, and fzf fuzzy history search.",
    keywords: [Array],
    canonicalUrl: "/blogs/powershell-bash",
  },
  slug: "powershell-bash",
  stem: "blogs/powershell-bash",
  tags: [[Object], [Object], [Object]],
  updatedAt: "2026-06-16",
  __hash__: "WCV4fSoaLUDA0dUR7PqLo36XtOuOWpbw9SoFH4Pq_GM",
};
