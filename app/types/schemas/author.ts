import z from "zod";

import { socialLinkSchema } from "./social-links";

const avatarSchema = z.object({
  src: z.string()
    .describe("Absolute path starting with '/' or valid URL for the profile picture"),
  alt: z.string()
    .default("Author profile picture")
    .describe("Accessibility descriptive alternative text"),
});

const companySchema = z.object({
  name: z.string()
    .min(2, "Company name must be at least 2 characters long")
    .describe("The official name of the company or organization"),
  website: z.string()
    .url("Provide a valid absolute web address starting with http/https")
    .describe("Official website URL of the company or organization"),
  role: z.string()
    .min(2, "Role description must be at least 2 characters long")
    .describe("The position or title held by the author within the company"),
  icon: z.string()
    .describe("Optional icon representation for the company, used in UI theming")
    .default("i-lucide-globe-check"),
});

export const authorSchema = z.object({
  id: z.string(),
  name: z.string()
    .min(2, "Name must be at least 2 characters long")
    .describe("The full identity or display name of the author")
    .default("Author Name"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens")
    .describe("Unique identifier for the author, used in URLs and references")
    .default("author-slug"),
  color: z.string()
    .default("#14b8a6")
    .describe("Optional color representation for the author, used in UI theming"),
  title: z.string()
    .default("Author")
    .describe("Professional title, e.g., 'Senior Software Engineer'"),
  company: z.array(companySchema).default([]),
  avatar: avatarSchema,
  description: z.string()
    .default("")
    .describe("type: text; An expansive biography covering achievements and specialization background"),
  email: z.string()
    .email("Provide a valid electronic mail string")
    .default("")
    .describe("Primary contact email for professional correspondence"),
  website: z.string()
    .url("Provide an absolute web address path starting with http/https")
    .default("https://github.com/Nodewave-EA")
    .describe("Personal blog, profile link, or developer portfolio address"),
  socialLinks: z.array(socialLinkSchema)
    .describe("Collection of social media or external profile links for the author")
    .default([]),
  featured: z.boolean()
    .default(false)
    .describe("Spotlight this author profile card on primary landing listings"),
  active: z.boolean()
    .default(true)
    .describe("Toggle off to deprecate historical profiles without breaking blog foreign relational integrity keys"),
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
});

export type BlogAuthor = z.infer<typeof authorSchema>;

const _exampleAuthor = {
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
};
