import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Case studies. Add a Markdown or MDX file under src/content/work.
 * Pages that render this collection are not built yet.
 */
const work = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/work',
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.string(),
    client: z.string().optional(),
    role: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
