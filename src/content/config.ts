import { z, defineCollection } from "astro:content";

const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
});

export type BlogSchema = z.infer<typeof blogSchema>;

const blogCollection = defineCollection({ schema: blogSchema });

const weeklySchema = z.object({
    title: z.string(),
    week: z.number(),
    type: z.enum(["short", "deep-dive"]),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    dataset: z.string().optional(),
    interactive: z.enum(["sql", "python"]).optional(),
    linkedinProblemUrl: z.string().url().optional(),
    linkedinSolutionUrl: z.string().url().optional(),
});

export type WeeklySchema = z.infer<typeof weeklySchema>;

const weeklyCollection = defineCollection({ schema: weeklySchema });

export const collections = {
    'blog': blogCollection,
    'weekly': weeklyCollection,
}