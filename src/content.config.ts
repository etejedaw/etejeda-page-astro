import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
			gallery: z
				.array(
					z.object({
						src: image(),
						alt: z.string().optional(),
						caption: z.string().optional()
					})
				)
				.optional(),
			disclaimer: z.string().optional(),
			order: z.number().default(99),
			draft: z.boolean().default(false)
		})
});

export const collections = { projects };
