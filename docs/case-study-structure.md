# Case Study Structure

Replaces "Portfolio Case Study Structure" (Oct 12, 2026). Agreed Nov 21, 2026.

This is a mental model, not a set of fixed labels. Every case study is told in the same order so a reader always knows where they are, but each section can bend to fit the project.

It is written for two readers. The scanner gives it 30 seconds and reads the header, the Overview and the decision titles. The careful reader slows down to check the thinking: the evidence behind the problem, what you considered and dropped, and what you would do differently.

## The order

| Section | What it does | Length |
| --- | --- | --- |
| Header | Names the project and frames it | Title of 15 words max, plus four facts |
| Overview | Summarises the whole case study | One short paragraph and a one-line outcome |
| Defining the problem | Sets the stage for the decisions | Concise: a few paragraphs and the visuals that prove it |
| Design decisions | The bulk of the page | 3 to 6 decisions, about 100 to 150 words each |
| Learnings & reflections | What you took away, honestly | One short section |

## Header

- **Title:** names the product, the user problem and the intent, in 15 words or fewer. Never just "Driver App Redesign".
- **Four facts:** Timeline, Role, Platform, Team. For example: 6 months · Lead Product Designer · Desktop · 1 PM, 3 engineers.
- **Hero:** a playground clip, a hero screen or a phone recording, matching what shipped.

## Overview

The introduction, and nothing more. It holds:

1. The product or vertical, in a sentence.
2. The duration, scope and your role, if the header facts need a sentence of context.
3. The main problem, as a negative signal: low conversion, high drop-off, slow task times, usability issues. Name the number if there is one. This is the teaser for Defining the problem.
4. What you did, in one line.
5. A one-line preview of the outcome: the actual result, or the projected one, clearly marked as projected.

If it runs past one short paragraph and the outcome line, it is doing another section's job.

## Defining the problem

The Problem part of the story. Usually something had to be redesigned, simplified or built new. This section explains why, and shows how you came to understand it.

- Lead with why it mattered, before any screenshots.
- Show the evidence: research, UX mapping, journey maps, research screenshots, stakeholder input or field reports. Name the source plainly, for example "ops team field reports from three clients". Never dress up stakeholder input as formal research.
- A How Might We line is optional, one sentence.
- Personas, journey maps and flows support the problem. They are never sections of their own.

Keep it concise. It sets the stage; it is not the story.

## Design decisions

The bulk of the page. A decision is anything you chose on purpose: the big moves that answer the problem, and the smaller details that add polish and make the work worth showing. Both belong here.

Each decision has an eyebrow ("Decision 01"), a title that says what you did and why, and a short body:

1. **What was wrong:** the problem this decision answers, with its evidence. For a polish detail, the friction it removes.
2. **What I considered:** only when there were real alternatives. Name what you dropped and why. Do not invent options for small details.
3. **What I did:** the choice, and the design moves that followed.
4. **Result:** the measured result, the feedback, or the projected impact, marked as projected.

Results live inside each decision. There is no separate results section; the Overview's outcome line sums them up.

Visuals sit with the decision they prove. Caption or update any frame that differs from the live product.

## Learnings & reflections

Talk honestly about what you learned, including the things that did not work. A reflection that only lists successes is a red flag: it suggests either no real difficulty, which nobody believes, or that the uncomfortable parts are being hidden.

A strong reflection is:

- **Specific:** tied to real moments from the project.
- **Personal:** what you took away, not what designers should know in general.
- **Honest about what failed:** what did not work, and what you would change if you did it again.

It reads like one designer talking to another. Never write lines like "I learnt the importance of user-centric design".

## Writing rules

- **Pass both gates.** The header, Overview and decision titles must hold up on a 30-second scan. The evidence and the options must hold up when someone slows down.
- **Pair every action with a result.** "Improved the UX" is not a line. If the result is still a placeholder, the line is not ready.
- **Name the evidence source.** Research, stakeholder input, field reports or support tickets, said plainly.
- **Mention AI only where it was used.** Say what it executed and what you decided. Where it was not used, say nothing.
- **Unshipped is not a weakness.** State projected impact as projected, and back it with validation and feedback.
- **Make every word earn its place.** Plain, direct sentences.

## On the site

- Layout: Figma "Inner Page draft 1" (4058:1340) is the template for every case study. Its Dispatch Live Map copy is sample text only.
- Side navigation lists the sections: Overview, Defining the problem, Design decisions, Learnings & reflections.
- Content: one Markdown file per case study in `src/content/work/`.

## Case study tracker

| Case study | Status | Open items |
| --- | --- | --- |
| Leta design system to working prototype (flagship) | Drafting | Title. Team and timeline. Field feedback. Prototype build time before and after. Rejected options from Figma. Pick two product decisions from: notifications as a ledger, depot as a filter, single-driver dispatch, killing the order creation wizard |
| Leta M-Pesa Mini App | Needs context | Everything except the 69% time-to-first-value figure from the About page |
| Leta Driver App redesign | Needs context | Shipped. Numbers or driver quotes behind the impact claims. Update Figma frames to the per-order swipe |
| Crunchr | Needs context | Material not shared yet. Phone recording is in the repo |
| Dispatch Live Map | On hold | Resumes in 2027 |
