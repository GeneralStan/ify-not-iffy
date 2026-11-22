import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Case studies, one Markdown file each under src/content/work.
 * Structure: docs/case-study-structure.md. Layout: Figma "Inner Page" (4110:3586), template
 * src/layouts/CaseStudy.astro.
 * Order: header (hero image, title, Role / Platform / Tools), Overview, Defining the problem, then
 * themed sections of numbered steps (1.0, 1.1, 2.0…), then Key takeaways.
 * Anything still "[TBD: …]" renders as a marked placeholder.
 */
const visual = z.object({
  kind: z.enum(['image', 'video', 'placeholder']),
  src: z.string().optional(),
  webm: z.string().optional(),
  poster: z.string().optional(),
  alt: z.string().default(''),
  label: z.string().optional(),
  caption: z.string().optional(),
});

/** A full-width image block, or two side by side (e.g. Before / After), each with its own caption. */
const block = z.union([visual, z.object({ pair: z.tuple([visual, visual]) })]);

/** Line icons for "What we uncovered" (Figma 4110:3586). */
const findingIcon = z.enum(['eye-off', 'zap-off', 'phone-off']);

const step = z.object({
  title: z.string(),
  /** One short paragraph: what was wrong, what you did and what came of it. */
  body: z.string(),
  visuals: z.array(block).default([]),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string().refine((value) => value.trim().split(/\s+/).length <= 15, {
      message: 'Title is 15 words max',
    }),
    name: z.string(),
    /** Work card and meta description. */
    summary: z.string(),
    order: z.number(),
    tags: z.array(z.string()).default([]),
    facts: z.object({
      role: z.string(),
      platform: z.string(),
      tools: z.string(),
    }),
    hero: visual,
    overview: z.object({
      body: z.string(),
      visuals: z.array(block).default([]),
    }),
    problem: z.object({
      body: z.string().optional(),
      /** "What we uncovered": the findings that define the problem (three in the layout). */
      findings: z.array(z.object({ icon: findingIcon.optional(), title: z.string(), body: z.string() })).default([]),
      /** Problem statement card: a How Might We line, with an optional illustration (top right). */
      hmw: z.string().optional(),
      hmwImage: z.string().optional(),
      visuals: z.array(block).default([]),
    }),
    /** Themed sections ("How I built it", "Acting on delays"…), each a run of numbered steps. */
    sections: z
      .array(z.object({ title: z.string(), steps: z.array(step).min(1) }))
      .min(1),
    takeaways: z.array(z.string()).min(1),
  }),
});

export const collections = { work };
