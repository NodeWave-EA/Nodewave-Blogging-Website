import z from "zod";

export const tagSchema = z.object({
  id: z.string(),
  name: z.string()
    .min(1, "Tag display label name string cannot be left blank")
    .describe("Human-readable label for the tag, used in UI and navigation")
    .default("Tag Name"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens")
    .describe("Unique identifier for the tag, used in URLs and references")
    .default("tag-slug"),
  description: z.string()
    .describe("type: text; Strategic contextual scope of what content files fall under this tag parameter mapping")
    .default("Tag description text"),
  icon: z.string()
    .default("i-heroicons-tag")
    .describe("Graphic token class for navigating index directories"),
  color: z.string()
    .regex(/^(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)|rgba\(\s*(?:\d{1,3}\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\)|[a-zA-Z]+)$/, "Color must be a valid CSS color format")
    .default("#64748b")
    .describe("Theme accent context hex mapping to stylize contextual tags inside frontend badge listings"),
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
});

export type BlogTag = z.infer<typeof tagSchema>;

const _exampleTag = {
  id: "tags/tags/devops.yml",
  color: "#64748b",
  description: "DevOps practices, tools, and methodologies for software development and operations.",
  extension: "yml",
  meta: {},
  name: "DevOps",
  slug: "devops",
  stem: "tags/devops",
  __hash__: "1-Da4WdSwDQ_NYSx338cokaBVrLXmjnafRhC9i-MYsw",
};
