# Case Study Structure

Replaces "Portfolio Case Study Structure" (Oct 12, 2026) and the Nov 21 structure. Updated Nov 26, 2026 to the new playbook and to Figma "Inner Page" (4192:24706).

Every case study follows the same page order. A case study can have fewer themed sections or steps, but never skips or reorders the parts below.

## Readers

Write for two readers at once:

- **The scanner** (about 30 seconds) reads the title, the impact metrics, the Overview and the step titles. These must tell the whole story on their own.
- **The careful reader** checks the evidence, the options I rejected, and whether the reflection is honest.

## Page order

### 1. Header

- Hero image or short clip (a marked slot until supplied).
- Title: 15 words or fewer. It names the product, the user problem and the intent. Never just "[Product] Redesign".
- Meta row: Role · Platform · Tools · Timeline.
- Impact metrics, directly under the meta row: two to four measured results, each a large number with a one-line label that says what it is compared against (e.g. "3 weeks" / "to build the design system, against an estimated 3 months"). Measured results only: nothing projected, nothing estimated without saying so. These numbers appear only here.

### 2. Overview

- One short paragraph: what the product does and who uses it, what was going wrong, and what I did. No numbers that already appear in the impact metrics.
- Then one image.

### 3. Defining the problem

- Short intro: one or two sentences on why it mattered.
- "What we uncovered": exactly three findings, each with an icon, a short title and two or three sentences. They must not overlap. Each names its source plainly (e.g. "Source: timed usability sessions").
- Problem statement card: one "How might we…" question, wide enough that every themed section answers part of it.
- Supporting research visuals with captions: journey maps, usability results, card sorts, surveys, field notes. Research visuals live here, never in a section of their own.

### 4. Themed sections (usually 2 or 3)

- A short title saying what the section achieved (e.g. "How I built it", "Completing daily tasks faster"). A shorter side-nav label is allowed ("Faster workflows").
- A run of numbered steps: 1.0, 1.1, 2.0, 2.1…
- Each step has:
  - Number and title: what was done and why, as a full phrase.
  - Principle label (optional, small, under the title): the heuristic or principle the step shows ("Visibility of system status", "Error prevention", "Recognition over recall", "Flexibility and efficiency of use", "Consistency and standards"). Named once; no separate heuristics section.
  - One paragraph, about 100 words, in this order: the problem and its evidence → the option I considered and why I dropped it → what I built → the result or feedback. No sub-headings.
  - Images: one full-width image or a pair, with optional captions. Before/after pairs preferred.
  - Optional pull quote beside the step it proves, at most one per case study.
- Each step is built around one main decision: **strategic** (what to build or not), **tactical** (how a screen or flow works) or **micro** (where a single element sits or what it says). Strategic decisions usually lead the first section; tactical ones fill the themed sections; micro decisions are supporting details inside a step, not steps of their own.

### 5. Results (always before Key takeaways)

- A status line: shipped, partly shipped, or not yet in production, said plainly, with any adoption.
- What people said: two or three quotes in quote marks, attributed by role and context, never by name (e.g. "Dispatcher, grocery client"). Without individual attribution, group them under their source ("From dispatchers and ops:"). Only word-for-word quotes go in quote marks; paraphrased feedback is plain text.
- Projected: at most one line, clearly marked as projected.
- Do not repeat the impact metrics. The heading can be renamed ("Feedback" in the Leta case study).

### 6. Key takeaways

- Two or three, each a title and one paragraph.
- Each ties a lesson to a real moment, says what didn't work, and says what I changed afterwards. A takeaway without the change is not finished.
- First person, plain and honest. No quotes and no metrics.

## Writing rules

- Plain, direct sentences. Short paragraphs. No jargon, no abbreviations, no marketing words.
- Every claim pairs an action with a result: measured, feedback, or projected and labelled as projected.
- Name every evidence source plainly. Never present stakeholder input as formal research.
- Mention AI only where it was used, and say what it executed and what I decided.
- Unshipped work is not a weakness: state its status plainly and back it with feedback and validation.
- Anonymise clients unless told otherwise ("a grocery client", "a restaurant chain").
- Each number appears once on the page.
- Anything missing is marked [TBD: what is needed], never guessed.

## Images

- Every section has at least one marked image slot that says what the picture should show.
- Visuals must match what was built or shipped; caption any frame that differs.
- Older explorations go inside the step they belong to, captioned "Earlier exploration", never in a gallery of their own.

## Layout rules

Figma "Inner Page" (4192:24706, Nov 26, 2026). They apply to every case study, in Figma and on the site.

- **Section rhythm:** every section is split from the next by a 720 divider with the same space above and below it: 80 on desktop, 56 on phones. The hero gets one too. Key takeaways ends with 120 below.
- **Header:** title, 720 divider, meta row, 720 divider, impact metrics card, all 24 apart.
- **Impact metrics** (Figma Impact 4202:25049): a 720 wide row of equal cards, 4 apart. Each card is Stone/50 with the 1px outline (#E3E3E3 at 40%), radius 8, 24 padding, an H3 value over a Body/Large label (Stone/900, 8 apart), centred. No rules between them. Phones: the cards stack, 4 apart.
- **Inside a section:** the title and each block are 56 apart. A step is a number over its title, 16 to the body, 24 to the images, all centred. Images are 24 apart, captions 8 below their image, pairs 20 apart.
- **Image boxes:** 1024 × 400 (a pair is two 502 boxes), Stone/100, radius 8, 1px Alpha/Border/Outline (#E3E3E3 at 40%). Every corner radius on the page is 8.
- **Screen images in a hero or card box** (Figma 4192:24709): in the 1024 × 400 box the screen is 774 wide, centred, 95 from the top and cropped at the bottom, radius 8, two soft shadows. The work card and the drawer hero show the same crop.
  - **Desktop:** sized from the box height (774/400 wide, 95/400 down), so a narrower box, like the work card, trims the sides.
  - **Phones (below 768):** sized from the box width instead. Keep Figma's share of space at either side (12.2% each, so the screen is 75.6% wide), keep the bottom crop at Figma's share (130 of 1024, measured from the box width), and apply it to the work card and the drawer alike.
- **Text width:** running text is 720 wide at most, centred. Captions follow their image.
- **Colour:** section titles Stone/950, step and takeaway titles Stone/900, running text and captions Stone/900, labels, step numbers and sources Stone/600.
- **Problem statement card:** Stone/50, radius 8, 40 padding, 300 tall, the How Might We line in H1 (653 wide) at the bottom. The illustration (200 square, top-right) is optional.
- **What we uncovered:** three findings in equal-height columns, 32 apart.
- **Results quote cards:** two columns 32 apart, each Stone/50 with the outline, radius 8, 32 padding, 208 tall, the quote in H3 Stone/900 (373 wide) centred vertically. Phones: one column, 24 padding.
- **Key takeaways:** each an H3 title over its 720 body, 16 apart, centred; takeaways 56 apart.

## On the site

- Layout: a drawer over Home on desktop, a bottom sheet on phones.
- Side navigation lists Overview, Defining the problem, each themed section (by its nav label or title), Results (by its heading) and Key takeaways.
- Content: one Markdown file per case study in `src/content/work/`; the shape is in `src/content.config.ts`.

## Case study tracker

| Case study | Status | Open items |
| --- | --- | --- |
| Leta design system to working prototype (flagship) | Drafting | Timeline. Metric labels that say what each is compared against. Finding sources. Step bodies (1.0 to 3.1), section 2 step titles, principle labels. Results status line and quote attribution. Second takeaway body |
| Leta M-Pesa Mini App | Needs context | Everything except the 69% time-to-first-value figure from the About page |
| Leta Driver App redesign | Needs context | Shipped. Numbers or driver quotes behind the impact claims. Update Figma frames to the per-order swipe |
| Crunchr | Needs context | Material not shared yet. Phone recording is in the repo |
| Dispatch Live Map | On hold | Resumes in 2027 |
