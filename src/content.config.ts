import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Case studies, one Markdown file each under src/content/work.
 * Structure: docs/case-study-structure.md. Layout: Figma "Inner Page" (4110:3586), template
 * src/layouts/CaseStudy.astro.
 * Order: header (hero image, title, Role / Platform / Tools / Timeline, impact metrics), Overview,
 * Defining the problem, themed sections of numbered steps (1.0, 1.1, 2.0…), Results, Key takeaways.
 * Anything still "[TBD: …]" renders as a marked placeholder.
 */
const visual = z.object({
  kind: z.enum(['image', 'video', 'placeholder']),
  src: z.string().optional(),
  webm: z.string().optional(),
  poster: z.string().optional(),
  /** A screen recording, placed and cropped as in Figma 4192:24709. */
  screen: z.boolean().optional(),
  alt: z.string().default(''),
  label: z.string().optional(),
  caption: z.string().optional(),
});

/** A full-width image block, or two side by side (e.g. Before / After), each with its own caption. */
const block = z.union([visual, z.object({ pair: z.tuple([visual, visual]) })]);

/** Line icons for "What we uncovered" (Figma 4110:3586). */
const findingIcon = z.enum(['eye-off', 'zap-off', 'phone-off']);

/** A word-for-word quote, attributed by role and context, never by name ("Dispatcher, grocery client"). */
const quote = z.object({ text: z.string(), by: z.string().optional() });

const step = z.object({
  title: z.string(),
  /** Optional: the usability heuristic or design principle the step shows ("Error prevention"). */
  principle: z.string().optional(),
  /** About 100 words: problem and evidence, the option dropped and why, what was built, the result. */
  body: z.string(),
  visuals: z.array(block).default([]),
  /** Optional pull quote beside the step it proves; at most one per case study. */
  quote: quote.optional(),
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
      timeline: z.string().optional(),
    }),
    /** Impact metrics under the meta row: two to four measured results, each shown only here. */
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .max(4, { message: 'Two to four impact metrics' })
      .default([]),
    hero: visual,
    overview: z.object({
      body: z.string(),
      visuals: z.array(block).default([]),
    }),
    problem: z.object({
      body: z.string().optional(),
      /** "What we uncovered": the findings that define the problem (three in the layout). */
      findings: z
        .array(
          z.object({
            icon: findingIcon.optional(),
            title: z.string(),
            body: z.string(),
            /** Where it came from, said plainly ("Timed usability sessions"). */
            source: z.string().optional(),
          }),
        )
        .default([]),
      /** Problem statement card: a How Might We line, with an optional illustration (top right). */
      hmw: z.string().optional(),
      hmwImage: z.string().optional(),
      visuals: z.array(block).default([]),
    }),
    /** Themed sections ("How I built it", "Acting on delays"…), each a run of numbered steps. */
    sections: z
      .array(
        z.object({
          title: z.string(),
          /** Shorter label for the side nav, when the title is long ("Faster workflows"). */
          nav: z.string().optional(),
          steps: z.array(step).min(1),
        }),
      )
      .min(1),
    /** Results, always before Key takeaways: status, what people said (quote cards), at most one
        projected line. The heading can be renamed ("Feedback" in the Leta wireframe). */
    results: z
      .object({
        title: z.string().default('Results'),
        status: z.string().optional(),
        /** Groups quotes under their source when individual attribution isn't known ("From dispatchers and ops:"). */
        quotesFrom: z.string().optional(),
        quotes: z.array(quote).max(3).default([]),
        projected: z.string().optional(),
      })
      .optional(),
    /** Two or three: a title and its paragraph(s) (the moment, what didn't work, what changed).
        A blank line in the body starts a new paragraph. */
    takeaways: z.array(z.object({ title: z.string(), body: z.string() })).min(1).max(3),
  }),
});

export const collections = { work };
