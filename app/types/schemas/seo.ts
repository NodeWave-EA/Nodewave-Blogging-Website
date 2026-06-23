import z from "zod";

const urlOrPathSchema = z.string().refine(
  value => /^https?:\/\//.test(value) || value.startsWith("/"),
  {
    message: "Must explicitly provide an absolute remote URL or a site-relative route string starting with '/'",
  },
);

export const seoSchema = z.object({
  title: z.string()
    .max(60, "Search Engines truncate header titles exceeding 60 characters")
    .describe("Primary SEO title string for search engine indexing and social media sharing")
    .default("Default SEO Title"),
  description: z.string()
    .max(160, "Meta snippets must sit under 160 characters to optimize visual display consistency")
    .describe("Primary meta description string for search engine indexing and social media sharing")
    .default("Default meta description"),
  keywords: z.array(z.string())
    .describe("Array of keyword strings for search engine indexing and social media sharing")
    .default([]),
  canonicalUrl: urlOrPathSchema
    .describe("Definitive primary source URL mapping to combat duplicate page authority penalties")
    .default("/"),
  ogTitle: z.string()
    .max(60, "Social networks cap structural headline displays around 60 characters")
    .describe("Open Graph title string for social media sharing")
    .default("Default OG Title"),
  ogDescription: z.string()
    .max(160, "Social post descriptions look best when kept under 160 characters")
    .describe("Open Graph description string for social media sharing")
    .default("Default OG Description"),
  ogImage: urlOrPathSchema
    .describe("Social banner image asset path matching a 1200x630 aspect ratio card layout")
    .default("/preview.png"),
  twitterTitle: z.string()
    .max(60, "Twitter cards truncate titles exceeding 60 characters")
    .describe("Twitter card title string for social media sharing")
    .default("Default Twitter Title"),
  twitterDescription: z.string()
    .max(160, "Twitter card descriptions look best when kept under 160 characters")
    .describe("Twitter card description string for social media sharing")
    .default("Default Twitter Description"),
  noIndex: z.boolean()
    .default(false)
    .describe("When true, instructs search engines to exclude this page from indexing"),
});

export type SEO = z.infer<typeof seoSchema>;

const _exampleSEO = {
  title: "How to Make PowerShell Behave Like Bash/Zsh (2026 Guide)",
  description: "Step-by-step tutorial to configure pwsh with emacs keybindings, fish-style autocomplete, carapace subcommand popups, and fzf fuzzy history search.",
  keywords: ["PowerShell", "Bash", "Zsh", "Tutorial", "Autosuggestions", "Completions", "Subcommands"],
  canonicalUrl: "/blogs/powershell-bash",
};
