# Ifeanyi Ulasika — portfolio

Foundation for Ify’s product and UX design site. Pages beyond a short home placeholder and the token style guide are not built yet. Designs are drawn in Paper and Figma and ported here against the CSS variables below.

Stack: Astro 7, TypeScript, plain CSS, static output. It deploys to GitHub Pages, and can also go to Vercel or Netlify.

The home page is the Work landing from Figma frames Work (Final)1 and Work (Final)2. `/tokens` is the style guide.

## Scripts

```sh
npm install
npm run dev      # http://127.0.0.1:4477 — regenerates tokens first
npm run build    # writes dist/
npm run preview
npm run tokens   # regenerate src/styles/tokens.css from tokens/tokens.json
```

`predev` and `prebuild` run the token generator, so a normal dev or build never serves a hand-written token file. `src/styles/tokens.css` is generated. Edit `tokens/tokens.json`, then run `npm run tokens` (or just `npm run dev` / `npm run build`).

## Structure

```text
tokens/tokens.json          Source of truth
scripts/generate-tokens.mjs Writes src/styles/tokens.css
src/styles/                 Reset, fonts, generated tokens, base
src/layouts/BaseLayout.astro
src/components/             Shared chrome (SiteHeader)
src/pages/index.astro       Placeholder home
src/pages/tokens.astro      Style guide
src/content.config.ts       Case-study collection schema
src/content/work/           Markdown / MDX case studies (empty for now)
public/fonts/               Exat CYR OTF files
```

Later routes, not created yet:

- `src/pages/about.astro`
- `src/pages/playground.astro`
- `src/pages/work/[slug].astro` rendering the `work` collection

When a Paper or Figma frame is ported, use the variables rather than new hex values or one-off sizes. Text roles are the `.text-display` … `.text-caption` classes (and `.text-nav`). Layout is `.container` and `.grid`, or the `--grid-*` variables directly. Motion uses `--motion-duration-*` and `--motion-ease-*`.

## Token workflow

Figma file **Ify’s Portfolio** is the design source. `tokens/tokens.json` is the source of truth in this repo. The generator turns it into CSS custom properties.

1. Change or export tokens into `tokens/tokens.json`.
2. Run `npm run tokens`.
3. Check `/tokens`. The page reads the generated custom properties, so a stale hand-edit of `tokens.css` will not survive the next build.

### Naming

Primitives:

| Kind | CSS | Example |
| --- | --- | --- |
| Color ramp | `--color-{ramp}-{step}` | `--color-lime-500`, `--color-neutral-700` |
| Alpha | `--color-{name}` | `--color-shadow-10`, `--color-lime-300-60` |
| Radius | `--radius-{name}` | `--radius-md` |
| Stroke | `--stroke-{name}` | `--stroke-thin` |
| Font | `--font-{display\|body\|mono}` | `--font-display` |
| Weight | `--font-weight-{light\|regular\|medium}` | `--font-weight-medium` |
| Breakpoint | `--breakpoint-{mobile\|tablet\|desktop}` | `--breakpoint-tablet` (768px) |
| Grid slot | `--grid-{columns\|gutter\|margin}-{mobile\|tablet\|desktop}` | `--grid-margin-desktop` |
| Active grid | `--grid-columns`, `--grid-gutter`, `--grid-margin` | follows the viewport |
| Motion | `--motion-duration-*`, `--motion-ease-*` | `--motion-duration-fast` |
| Type role | `--type-{role}-size`, `-line-height`, `-tracking`, `-weight`, `-family` | `--type-display-size` |

Roles: `display`, `h1`, `h2`, `h3`, `nav`, `body-lg`, `body`, `label`, `meta`, `caption`. Utilities match the role: `.text-display`, `.text-h1`, `.text-body-lg`, `.text-meta`. `.nav-active` only changes weight to `--type-nav-active-weight` (medium). Put it on an element that already has `.text-nav`.

Semantic color is a short alias list. Each one points at a primitive:

| Variable | Default |
| --- | --- |
| `--color-bg` | `--color-lime-0` (warm near-white) |
| `--color-surface` | `--color-neutral-0` |
| `--color-text` | `--color-lime-950` |
| `--color-text-muted` | `--color-neutral-700` |
| `--color-accent` | `--color-lime-500` |
| `--color-border` | `--color-neutral-200` |

Retune these in `semantic.color` inside `tokens.json`. Alpha colors are primitives, not semantic roles: `--color-shadow-10`, `--color-shadow-75`, `--color-highlight-10`, and `--color-lime-300-60` (`rgba(191,229,77,0.60)`, Lime/300 at 60%, for hero highlight words).

### Letter-spacing

Figma’s `letter-spacing/*` variables are stored in **pixels**. `tokens.json` does not copy those pixel numbers. Tracking is a **percentage of the font size** (`"tracking": -2` means −2%). The generator converts that percentage to `em` (`-2` → `-0.02em`) for `--type-*-tracking` and for `letter-spacing` on the utilities.

The percentage is the same at both breakpoints, which is why the Figma pixel values shrink with the mobile size (desktop display is −1.12px on 56px; mobile is −0.8px on 40px; both are −2%). Keep editing the percentage in the JSON. Do not paste the Figma px value into CSS.

Type size fluidly scales from the 390px mobile frame to the 1440px desktop frame with `clamp`. Display, h1, and h3 use a unitless line-height of 1 so the leading stays tight as the size changes. Nav is 24/32 at desktop (letter-spacing −0.8px, stored as −3.333%) and 18/24 on mobile, ratio 1.333. h2 uses the same 1.333 ratio (24/32 mobile, 36/48 desktop). Body leading stays 1.5. The grid has three stops: mobile below 768, tablet from 768 up to just under 1440, desktop at 1440 and above.

### Fonts

Geist and Geist Mono load from the official `geist` package (variable woff2 files).

**Exat CYR** is loaded from the OTF files in `public/fonts/`:

- `exatcyr-extralight.otf` (weight 200)
- `exatcyr-light.otf` (weight 300)
- `exatcyr-regular.otf` (weight 400)
- `exatcyr-medium.otf` (weight 500)
- `exatcyr-bold.otf` (weight 700)
- `exatcyr-extrabold.otf` (weight 800)
- `exatcyr-black.otf` (weight 900)

`@font-face` rules in `src/layouts/BaseLayout.astro` point at those files and include the GitHub Pages base path. Display and nav roles use this family. Body text stays on Geist.

## Adding a case study

Create `src/content/work/leta.md` (or `.mdx`):

```md
---
title: Rebuilding the dispatch live map
summary: A clearer live map for dispatchers tracking delayed orders.
year: "2025"
client: Leta
role: Product designer
tags:
  - Logistics
  - Design systems
cover: /images/leta-cover.jpg
featured: true
order: 1
draft: false
---

The story goes here.
```

The `work` collection in `src/content.config.ts` validates that frontmatter. `draft: true` is for pieces that should stay out of a future index. There is no case-study route yet; the schema is the stub those pages will use.

## Placeholder links

These targets are stand-ins. Replace them before publishing:

- “Shoot me a message” and “Email” → `mailto:ify@example.com`
- “Linkedin” → `https://www.linkedin.com/in/placeholder`

“View resume” opens `/resume/ifeanyi-ulasika-resume.pdf` in a new tab. The link is prefixed with the site base.

Playground and About in the flap nav are in-page anchors (`#playground`, `#about`) at the footer until those pages exist. Work scrolls to `#work`.

## Deploy

`astro.config.mjs` sets `site: 'https://generalstan.github.io'` and `base: '/ify-not-iffy'`, so the site is served at `https://generalstan.github.io/ify-not-iffy/`. In-site links and the favicon go through that base. Imported images are base-aware via Vite.

Local preview after a build:

```sh
npm run build
npm run preview
```

Open `http://127.0.0.1:4477/ify-not-iffy/` (and `/ify-not-iffy/tokens`). `npm run dev` uses the same base.

**GitHub Pages:** `.github/workflows/deploy.yml` builds with `withastro/action` and deploys with `actions/deploy-pages` on every push to `main`. In the GitHub repo settings, set Pages to “GitHub Actions”. The repository this workflow expects is `GeneralStan/ify-not-iffy`.

**Vercel:** framework preset Astro. If the project is not hosted under `/ify-not-iffy`, remove `base` (and keep `site` as the production origin) before deploying.

**Netlify:** `netlify.toml` publishes `dist`. Same note on `base` if the site is served from the domain root.

## Reduced motion

`prefers-reduced-motion: reduce` collapses animation and transition duration, and sets `--motion-duration-fast`, `--motion-duration-base`, and `--motion-duration-slow` to `0ms`. New motion should use those variables so the preference keeps working.
