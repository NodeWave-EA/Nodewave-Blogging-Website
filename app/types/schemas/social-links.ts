import z from "zod";

export const socialLinkSchema = z.object({
  platform: z.string()
    .describe("Name of the social media platform, e.g., 'GitHub', 'Twitter'"),
  url: z.string()
    .url()
    .describe("Absolute URL to the author's profile on the specified social media platform"),
  icon: z.string()
    .default("i-line-md-external-link")
    .describe("Optional icon representation for the social platform"),
  color: z.string()
    .default("#14b8a6")
    .describe("Optional color representation for the social platform"),
});

export type SocialLink = z.infer<typeof socialLinkSchema>;

const _exampleSocialLink = {
  platform: "GitHub",
  url: "https://github.com/Yebei-Gideon",
  icon: "i-line-md-github-loop",
  color: "#14b8a6",
};

// TODO
// make it resable buttonprops eg label, to,icon etc
