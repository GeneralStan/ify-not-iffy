---
name: paper-sync
description: Sync design changes from the Paper file "Nnamdi's Website" into this codebase (or code changes back into Paper), review them locally, and prepare them for publishing. Use when the user says "sync from Paper", "pull the Paper changes", "update the site from Paper", "update Paper from the code", or asks to apply edits made in Paper.
---

# Paper sync

The full contract is in `docs/paper-workflow.md`. Read it in full before starting; it holds the file ID, the layer → file map, the token map, and the rules. This skill is the short checklist.

1. **Prepare**
   - Read `docs/paper-changes.md` for `pending` entries.
   - Make sure `git status` is clean. Branch `paper-sync/<yyyy-mm-dd>` from `main`.
2. **Read Paper** (file `01M7T1BWWTKQNY6Q4D2GWJC26N`)
   - Load the `paper-mcp-instructions` guide, then run `get_basic_info` on the "Website" and "Design System" pages.
   - Run `get_tokens` (css) and diff it against the token map (§5 of the guide).
   - For each changed section, use `get_tree_summary` to find it, then `get_jsx` (`includeNodeIds: false`) and `get_computed_styles` for exact values. Use `get_fill_image` for swapped photos. Never read values from screenshots.
   - With no log entries, do a full pass: compare every section's copy, colours, sizes and images on both artboards with the code.
3. **Diff**
   - List every change as section → property → old → new, with desktop and mobile values.
   - Show the list to the user before editing when they are present.
4. **Apply** using the project's conventions:
   - Copy goes in `src/lib/content.ts`.
   - Tokens go in `src/app/globals.css`, using the `PHONE → DESIGN` formula.
   - One-off sizes use `fluid(phone, design)`.
   - Images go in `public/images/` as WebP, referenced with `asset()`.
   - Keep code-only behaviour: Motion animations, rails, the menu and the scroll edges.
5. **Verify**
   - Run `pnpm lint` and `pnpm build`.
   - Preview the site at 1440×900 and 393×852 (`preview_start` "nnamdi-site", or headless Playwright) and compare it with the Paper frames.
   - If the CSS looks stale, delete `.next/dev` and restart the server.
6. **Commit and log**
   - Commit on the branch.
   - Mark the log entries `synced <hash>`.
   - Report the change list and screenshots.
7. **Publish only when the user explicitly says so.**
   - Merge to `main`, then push as GeneralStan with the one-off credential helper in §8 of the guide.
   - Watch the Pages run, confirm the live site, and mark the entries `live`.

**Code → Paper:** when code changed first, update the matching Paper layers on both artboards, and the Components board copies, so the file stays accurate. Then log it as "code → Paper". Paper has no component instances, so every copy of a shared element must be edited.
