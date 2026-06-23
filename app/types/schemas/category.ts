import z from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string()
    .min(1, "Category title classification string cannot be empty"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens")
    .describe("Unique identifier for the category, used in URLs and references")
    .default("category-slug"),
  description: z.string()
    .describe("type: text; Deep structural description outlining the thematic scope of this category module grouping")
    .default("Category description text"),
  icon: z.string()
    .default("i-heroicons-folder")
    .describe("Graphic token class for navigating index directories"),
  color: z.string()
    // allow all color formats: hex, rgb, rgba, hsl, hsla, named colors
    .regex(/^(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)|rgba\(\s*(?:\d{1,3}\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\)|[a-zA-Z]+)$/, "Color must be a valid CSS color format")
    .default("#64748b")
    .describe("Theme accent context hex mapping to stylize contextual categories inside frontend badge listings"),
  featured: z.boolean()
    .default(false)
    .describe("Display category card on primary hub navigation dashboards"),
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
});

export type BlogCategory = z.infer<typeof categorySchema>;

const _exampleCategory = {
  id: "categories/categories/terminal-and-shells.yml",
  description: "Deep dives into shell configurations, command-line utilities, and productivity workflows.",
  extension: "yml",
  featured: false,
  icon: "i-heroicons-folder",
  meta: {},
  name: "Terminal and Shells",
  slug: "terminal-and-shells",
  stem: "categories/terminal-and-shells",
  __hash__: "WbdOyi_nFdzD0_Dsa6eD0zdgCyuat66iCYZyKSSJQ9g",
};
