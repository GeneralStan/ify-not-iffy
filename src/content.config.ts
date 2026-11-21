import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Case studies, one Markdown file each under src/content/work.
 * Structure: docs/case-study-structure.md (Header, Overview, Defining the problem,
 * Design decisions, Learnings & reflections). Template: src/layouts/CaseStudy.astro.
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

const decision = z.object({
  title: z.string(),
  /** What was wrong: the problem this decision answers, with its evidence (or the friction a detail removes). */
  wrong: z.string(),
  /** What I considered: only when there were real alternatives. */
  considered: z.array(z.object({ name: z.string(), reason: z.string() })).optional(),
  /** What I did: the choice and the design moves that followed. */
  did: z.string(),
  /** Result: measured result, feedback, or projected impact (say "projected"). */
  result: z.string(),
  visual: visual.optional(),
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
      timeline: z.string(),
      role: z.string(),
      platform: z.string(),
      team: z.string(),
    }),
    hero: visual,
    overview: z.object({
      body: z.string(),
      outcome: z.string(),
    }),
    problem: z.object({
      body: z.string(),
      hmw: z.string().optional(),
      /** "What we uncovered": findings that define the problem, with their evidence. */
      findings: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
      visuals: z.array(visual).default([]),
    }),
    decisions: z.array(decision).min(3).max(6),
    learnings: z.array(z.string()).min(1),
  }),
});

export const collections = { work };
