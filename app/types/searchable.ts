import { z } from "zod";

export const searchableSchema = z.object({
  id: z.string()
    .describe("Unique identifier for the searchable item"),
  title: z.string()
    .describe("Title of the searchable item"),
  titles: z.array(
    z.string(),
  )
    .describe("Array of titles for the searchable item"),
  content: z.string()
    .describe("Content of the searchable item"),
  level: z.number()
    .describe("Level of the searchable item, indicating its depth or hierarchy"),
});

export type Searchable = z.infer<typeof searchableSchema>;
