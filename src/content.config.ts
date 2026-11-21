import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const visual = z.object({
  kind: z.enum(['image', 'video', 'placeholder']),
  src: z.string().optional(),
  webm: z.string().optional(),
  poster: z.string().optional(),
  alt: z.string().default(''),
  label: z.string().optional(),
});

const option = z.object({
  name: z.string(),
  reason: z.string(),
});

const action = z.object({
  title: z.string(),
  problem: z.string(),
  options: z.array(option).min(1),
  action: z.string(),
  impact: z.string(),
  visual: visual.optional(),
});

/**
 * Case studies. One Markdown file per study under src/content/work.
 * The page template is src/layouts/CaseStudy.astro.
 * Titles stay at 15 words or fewer.
 */
const work = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/work',
  }),
  schema: z.object({
    title: z.string().refine((value) => value.trim().split(/\s+/).length <= 15, {
      message: 'Title is 15 words max',
    }),
    name: z.string(),
    summary: z.string(),
    order: z.number(),
    tags: z.array(z.string()).default([]),
    role: z.string(),
    scope: z.string(),
    timeline: z.string(),
    hero: visual,
    problem: z.object({
      body: z.string(),
      hmw: z.string().optional(),
      visual: visual,
    }),
    actions: z.array(action).min(3).max(5),
    impact: z.object({
      metrics: z.array(
        z.object({
          value: z.string(),
          label: z.string(),
          projected: z.boolean().default(false),
        }),
      ),
      quotes: z.array(
        z.object({
          text: z.string(),
          source: z.string(),
        }),
      ),
      reflection: z.string(),
    }),
  }),
});

export const collections = { work };
