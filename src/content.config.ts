import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const projects = defineCollection({
	loader: glob({ pattern: "*.md", base: "./src/content" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			short: z.string(),
			description: z.string(),
			tags: z.array(z.string()),
			color: z.string(),
			category: z.enum(["Freelance", "Personal", "Investigación"]),
			year: z.string().optional(),
			github: z.string().optional(),
			url: z.string().optional(),
			image: image().optional(),
			order: z.number().default(99),
			draft: z.boolean().default(false)
		})
});

export const collections = { projects };
