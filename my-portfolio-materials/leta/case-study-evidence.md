# Case study evidence brief: the Leta dispatcher dashboard redesign

Compiled 2026-11-27 for the portfolio case study "Rebuilding Leta's design system and dispatch workflows so dispatchers see problems early and act faster". Evidence only, not copy.

**Sources searched**
- `docs/specs/` (14 files), `docs/design-decisions.md`, `docs/history.md`, `PLAN.md`, `CLAUDE.md`, `docs/conventions/`.
- Git history of this repo (402 commits on `main`, 2026-07-05 to 2026-11-26), with tags and branches.
- Saved Claude Code sessions for this repo: `~/.claude/projects/-Users-ifeanyi-Sandbox-LETA` (45 transcripts) and its worktree folder (3). Only Ifeanyi's own typed messages were read: 672 messages, dated 2026-06-29 to 2026-11-26. **There are no saved sessions before 2026-06-29**, so the design-system build in May and June is dated from the docs only.
- The Figma file was not used.

**How to read the sources**
- `Spec, §` is a section of a spec in `docs/specs/`.
- `commit abc1234 (date)` can be opened with `git show abc1234`.
- `Session 2026-08-05` is one of Ifeanyi's messages on that date. Quotes are verbatim, typos included.

---

## OVERVIEW

### Dates

| Fact | Finding | Source |
|---|---|---|
| First commit | 2026-07-05, "Initial commit: LETA design system + interactive playground". It already contained the design system and a working playground. | commit `0cfa00c` (2026-07-05) |
| Earliest dated design-system work | 2026-05-10 ("Figma a11y documentation (written 2026-05-10)") | `CLAUDE.md`, heading at line 406 |
| Token and component baseline | 2026-05-23 to 2026-05-25. The first Figma baseline is 2026-05-23, and an icon added 2026-05-24. | `PLAN.md` "Pending Figma sync (2026-05-23)"; `docs/history.md`, Build status log |
| Component build | Molecules batch 1 shipped 2026-05-28. Organisms batch 1 (navigation and table stack) complete 2026-06-16. Templates built 2026-06-23. "Pages — COMPLETE (2026-06-24)". | `PLAN.md` lines 421, 485, 518; `docs/history.md` |
| Playground first built and deployed | 2026-07-04 to 2026-07-05 | `PLAN.md` "Phase 3 — Interactive Playground — ✅ built, hardened, deployed (2026-07-04 → 2026-07-05)" |
| Last commit | 2026-11-26 | git log |
| Before the repo | Ifeanyi says the specs began in months of earlier brainstorming in Claude chat (quote below). That chat is not in this repo and was not searched. | Session 2026-10-02 |

**Your "3 weeks" estimate.** The dated records put the design-system build at about **4.5 weeks**: from the 2026-05-23 token baseline to "Pages — COMPLETE" on 2026-06-24. Counting from the earliest dated entry (2026-05-10), it is about 6.5 weeks. Nothing in the sources says "3 weeks". Figma syncs and component additions then continued to 2026-11-25 (release 0.16.0).

**Your "9 months" timeline.** The earliest dated record (2026-05-10) to the last commit (2026-11-26) is about 6.5 months. The earlier brainstorming is described but not dated:

> "I used claude chat from my personal account which i've been using to brainstorm for many months on this redesign long before we started the interactive playground and storybook projects. Most of the specs we have today first originated from it" (Session 2026-10-02)

Not found: a start date that would confirm 9 months.

**Commit activity by month** (number of days with at least one commit):

| Month | Days |
|---|---|
| July | 20 |
| August | 20 |
| September | 15 |
| October | 14 |
| November | 16 |

### Counts

| Fact | Finding | Source |
|---|---|---|
| Components | **108 component folders** in `packages/components/src/` (not counting `utils`), with **222 export lines** in `index.ts`. So your "100+" holds. | `ls packages/components/src` |
| Icons | "356 icon components → 254 semantic `IconName`s" | `docs/history.md`, Build status log |
| Specs | **14 spec files** in `docs/specs/` (see the next table). Not six. | `docs/specs/README.md` |
| Logged design decisions | **53**, scored for usability and looks in `docs/design-decisions.md` (compiled 2026-10-16, entries 46 to 53 added 2026-10-18). 79 commits since 2026-10-17 are not in it yet. | `docs/design-decisions.md`; `git rev-list --since=2026-10-17` |
| Releases | 21 version tags, from `letaio-v0.0.5` (2026-08-09) to `v0.16.0` (2026-11-25). Published to npm since 0.2.0 (2026-09-17). | `git tag`; `CLAUDE.md` Publishing |
| Claude Code skills | **4** project skills, not three (see 1.1). | `.claude/skills/` |

The 14 spec files:

| Spec | What it covers | First committed |
|---|---|---|
| Doc 1, Order Management: Foundations & Logic | The orders table, order creation, the order drawer, dispatch, reassigning, cancel, reschedule and return, bulk actions | 2026-07-11 (`86cb1b9`) |
| Doc 2, Configuration Reference | Every setting a company can configure | 2026-08-05 (`1fc147a`) |
| Doc 3, Interaction & Component Patterns | Shared component behaviour | 2026-07-17 (`c64c22c`) |
| Doc 4, SLA & Fulfilment-Time Specification | Time targets and the On Time / At Risk / Delayed logic | 2026-07-11 (`86cb1b9`) |
| Doc 5, Broadcast & Fleet Configuration | Broadcast rounds, priority driver groups, fallback | 2026-08-05 (`1fc147a`) |
| Doc 6, Trip Lifecycle & Logic | What a trip is and how stops resolve | Not determined |
| Doc 7, Depot Configuration & Zones | Pickup zones, pausing broadcasts | Not determined |
| Doc 8, Trip Drawer Specification | The trip drawer | 2026-10-02 (`293e347`) |
| Doc 10, Notifications Specification | The notifications panel | 2026-10-14 (`d4bcfe6`) |
| Doc 11, Search Overlay Specification | Global search | 2026-10-21 (`6d436d9`) |
| Doc 12, Profile Specification | My Account and the profile drawer | 2026-11-25 (`2d19a64`) |
| Table Column Layout Specification | How table columns are sized | Not determined |
| Order Narrative Matrix | What the drawer says for each status | Not determined |
| Changelog: Bulk Actions & Reschedule Suggestions | Bulk cancel and reschedule brought into scope | Not determined |

Doc 9 is reserved for rate cards and was never written. The first-commit dates are what `git log --diff-filter=A` returned. Where it gave a hash without a clear file, the date is marked "Not determined".

---

## SECTION 1: HOW I BUILT IT

### 1.0 Design system first

**a) Problem**
- Brand assets, tokens, components, rules, specs and flows were scattered across tools and Figma links. Source: Session 2026-09-02, a write-up for the manager:

  > "all our company brand assets(colors, typography etc), design system tokens, components, rules, feature specs & user flows were stored across different software, documents and numerous figma prototype links which are not ideal for engineering handoff or demoing features or user flows to all our various customers with their different business needs."

- Not found: a written description of the state of the partial Figma library before the rebuild.

**b) Options considered**
- An off-the-shelf component library: Not found.
- Waiting for engineering: Not found.

**c) What was built** (`README.md`; `PLAN.md` phases; `docs/history.md`)
- A code copy of the Figma library, with Figma as the source of truth ("mirroring the Figma file as the source of truth", `CLAUDE.md`, Project goal).
- Tokens are generated from Figma variables by a command-line tool (`packages/cli`): `tokens:fetch`, `tokens:generate` and `tokens:check`. CI fails if the code drifts from Figma (`README.md`, Tokens).
- Light and dark modes exist as token sets (`PLAN.md` 1C: "`[data-theme="dark"]` overrides"). An in-app theme switcher (System / Light / Dark) shipped 2026-08-23 (commit `bf7e27a`; design-decisions #26), with dark-mode work on 2026-08-24 (`1cf1277`, `21addb4`).
- Storybook with foundation stories (Colors, Typography, Spacing and others) and stories per component (`docs/history.md`). Storybook was deployed 2026-07-05 (`04767f3`, `7469d11`).
- An icon package backed by Material Symbols (`docs/history.md`).
- Components published to npm as `@leta-io/design-tokens`, `@leta-io/icons` and `@leta-io/components` (`CLAUDE.md`, Publishing; commit `8d13f3e`, 2026-09-14).

**d) Decisions**
- **Strategic:**
  - Build the design system in code first, mirroring Figma, and only then the playground (`PLAN.md` phase order: tokens, then components, then playground).
  - Keep the repository private and publish only the built packages (`CLAUDE.md`, Publishing).
- **Tactical:**
  - Tokens are generated, never hand-edited.
  - CI catches drift between Figma and code (`README.md`).
- **Micro:**
  - The default icon style is outlined, not filled. Source: Session 2026-07-21: "I think we need to set our default icon library to outlined and not filled, the filled variants will still exist but will be used only when specified".

**e) Reversals**
- Token renames from Figma updates on 2026-06-19 and 2026-06-22 ("Token rename round 2 (2026-06-22)… 426 vars"). Source: `PLAN.md` lines 446–448.
- The colour-mode names became "Light Theme / Dark Theme" on 2026-10-18 so a theme can apply to one surface. Source: design-decisions #47.

**f) Feedback or results**
- An internal product, NickOS, installs the components from npm ("NickOS installs from it", `CLAUDE.md`, Outstanding).
- Not found: engineers' feedback on the design system.

**g) Before/after candidates**
- `docs/design-decisions/img/theme-before.jpg` and `theme-after.jpg` (light only, then dark).
- Storybook: no screenshots found.

**h) Sources**
- `README.md`, `PLAN.md` (Phases 0–2, Templates, Pages), `docs/history.md` (Build status log), `CLAUDE.md` (Project goal, Publishing).
- Commits `0cfa00c`, `bf7e27a`, `1cf1277`, `8d13f3e`.
- Session 2026-09-02.

### 1.1 Specs, skills and the playground

**a) Problem**
- Specs used to be audited in separate chats and passed back and forth. Source: Session 2026-07-19:

  > "The docs in the repo will act as the source of truth, no more isolated sessions where you audit and i share the audit feedback and regenerate a new md to share again with you."

**b) Options considered**
- Separate chat audits that produced new markdown files, dropped for specs kept in the repo (same quote as above).
- Not found: other options considered.

**c) What was built**
- **Specs:** 14 spec files, listed under Counts. `docs/specs/README.md` calls the folder the "single source of truth for the specs driving the LETA On-Demand dispatcher interactive playground".
- **Skills:** four, in `.claude/skills/`:

  | Skill | What it does | Added |
  |---|---|---|
  | `figma-design-system-sync` | Scans the Figma library, compares it with the last snapshot and reports what changed so the code can be brought back in line | In the first commit, 2026-07-05 (`0cfa00c`); version 0.4.0 on 2026-09-11 (`8ede593`) |
  | `table-column-layout` | Applies the table column layout spec when a table is built or changed | In the first commit, 2026-07-05 (`0cfa00c`) |
  | `figma-wireframe-parity` | Builds a Figma wireframe to match it exactly, in four steps: list everything, present the list, build, then compare screenshots | 2026-07-15 (`d4e742b`). Its steps appear in Ifeanyi's message that day ("Step 3 — Build… Step 4 — Parity verification") |
  | `prototype-to-figma` | Draws a live playground screen into Figma with real library components | 2026-11-03 (`29d1d49`) |

- **Playground:** a React app (`apps/playground`) built only from the library components, deployed on Vercel (`PLAN.md` Phase 3). It has a demo sign-in (`apps/playground/src/pages/auth/LoginPage.tsx`).
- Purpose, in Ifeanyi's words (Session 2026-09-02):

  > "The interactive prototype was built to let the product team validate ideas faster(using real documented design system components for consistency and better UX), visualize demo complex workflows to internal teams(Engineering, ops, customer support) and customers alike(especially on the order management side), it also helps the product team to catch and build for edge cases that would usually take months of user feedback and iteration"

**Moments where builds drifted, and what fixed them**

| Date | What went wrong | What fixed it | Source |
|---|---|---|---|
| 2026-07-20 | Wireframes not listed properly before building | Asked for a redo with the parity skill | Session: "Because there were many interruptions, i don't believe you enumerated the wireframes for Order details overview properly. Redo the enumeration for each wireframe… using the /figma-wireframe-parity skill again as there were a lot of details you missed along with wrong styling" |
| 2026-07-21 | Wrong padding and filled icons | Outlined icons made the default | Session: "your implementation missed a lot of things e.g wrong padding, using filled instead of outlined icons" |
| 2026-07-15 | The rule that came out of the early misses | Persisted as a standing rule | Session: "Yes exactly, verify!, verify!, verify!" |
| 2026-08-12 | Ad-hoc components built from a walk through the screens, not from each component's variants | Components listed again with measured values | Session summary pasted by Ifeanyi: "The parity misses all traced to one mistake: I built the ad-hoc components from a walk of the wireframe screens instead of enumerating each component set, so I never saw the per-state variants." |
| 2026-09-11 | Wrong rating badges and avatars on the trip card | Trip card listed again from scratch | Session: "the styling of the driver rating badges is wrong and you're using the wrong Avatar components. Why did this drift happen? Fix it" |
| 2026-09-17 | Trip logic drifting from the docs | (Same message raises it) | Session: "right now i feel there are a lot of inconsistencies similar to when broadcasting logic was very erroneous and drifting from the documentation we made." |
| 2026-10-02 | Code and spec disagreeing | A standing instruction to stop and ask | Session: "If code and spec disagree, stop and tell me. Don't resolve it quietly." |
| 2026-11-19 | Wrong drawer patterns (on NickOS, a separate product built on the same design system) | Patterns written into the design-system docs | Session: "I also notice you keep using the dual column pattern in all the drawers you create. I'm not sure why you decided to start using this pattern but it is wrong." Recorded in `docs/conventions/lists-cards-banners-and-drawers.md` (ruled 2026-11-19, `CLAUDE.md` line 338) |

Two more guards: `audit:mocks` "fails the build" (Session 2026-09-18 prompt), and the type checks run on both packages.

**Idea to working prototype, timed from commits and sessions**

| Flow | Timeline | Elapsed | Source |
|---|---|---|---|
| Global search | Brief filed by 07:24 (`806ed71`), spec committed 12:50 (`6d436d9`), working overlay committed 13:51 (`dd7920e`), all on 2026-10-21 | About 6.5 hours | git log |
| Notifications ledger | Brief sent 2026-10-14 at 18:59, draft spec committed 22:34 (`d4bcfe6`), rebuilt panel committed 2026-10-15 at 10:29 (`2ba43fc`) | About 15.5 hours | Session 2026-10-14; git log |
| Status filter | Rulings committed 2026-10-02 at 21:26 (`2db0878`), feature committed 22:01 (`ef1fdcd`). The rulings date from 2026-09-30, so the build time is not measurable from git. | Not measurable | git log |

**d) Decisions**
- **Strategic:**
  - Specs in the repo are the source of truth (Session 2026-07-19).
  - Build the playground only from library components ("compose @leta/components only, never hand-roll", Session 2026-07-14).
- **Tactical:**
  - A four-step parity process: list everything, present it, build, verify (skill added 2026-07-15).
  - Stop and ask when code and spec disagree (Session 2026-10-02).
- **Micro:** Not found.

**e) Reversals**
- Specs changed in a separate brainstorming chat were brought into the repo, then the build was reconciled to them (Session 2026-10-02).

**f) Feedback or results**
- Not found: recorded feedback on the specs or skills from others.

**g) Before/after candidates**
- `design-parity/` inventories, for example `design-parity/trip-drawer-inventory.md`, referenced in Session 2026-09-14.

**h) Sources**
- `docs/specs/README.md`, `.claude/skills/*/SKILL.md`, `PLAN.md` Phase 3.
- Commits `0cfa00c`, `d4e742b`, `29d1d49`, `8ede593`, `806ed71`, `6d436d9`, `dd7920e`, `d4bcfe6`, `2ba43fc`.
- Sessions 2026-07-14, 07-15, 07-19, 07-20, 07-21, 08-12, 09-02, 09-11, 09-17, 10-02, 11-19.

---

## SECTION 2: SEEING AND ACTING ON WHAT NEEDS ATTENTION

### 2.0 Summary cards and SLA badges

**a) Problem**
- "nothing on the page said how many orders were late" (`docs/design-decisions.md` #1).
- SLA tracking was one of the usability problems in the old platform (Session 2026-09-02: "from order status filtering, SLA tracking, reassignments and more").

**b) Options considered**
- **A single 40-minute timer:** Not found as an option that was considered and rejected. What is recorded:
  - The 40 minutes is only a reference total, the sum of five stage targets. Session 2026-08-05: "the 40 min in the doc is just an examplt, OFTs are a sum of the total 5 SLA set. 30 min was just the arbitrary value i used for the interactive prototype."
  - A "chain-adjusted" total (stretched for later drop-offs on a trip) was the first draft. It was replaced on 2026-07-08 by a constant total with paused clocks. Source: Doc 4 §1.2 "ruled 2026-07-08 — supersedes the chain-adjusted draft"; Revision history v1.1 "Model corrected from design walkthrough".

**c) What was built**
- **Five stage targets in two phases** (Doc 4 §1). Reference values:

  | Phase | Stage | Reference |
  |---|---|---|
  | Dispatch and pickup | Assignment | 5 min |
  | Dispatch and pickup | Travel to depot | 10 min |
  | Dispatch and pickup | Pickup | 5 min |
  | Drop-off | Travel to destination | 15 min |
  | Drop-off | Completion | 5 min |

- **The total** (Expected Order Fulfilment Time) is the sum of the five, 40 minutes in the reference, and "is never stretched for later drop-offs" (Doc 4 §1). The counter reads "{elapsed} / 40m SLA" (Doc 4 §1.2).
- **Delayed:** the current stage's clock passes its target, or the total passes the expected time. One stage breach is enough (ruled 2026-07-08).
- **At Risk:** the platform predicts a stage will be missed from the driver's location, speed, direction, the depot location and the drop-off location, before anything has breached. Order of priority: Delayed > At Risk > On Time (Doc 4 §3).
- **Finished orders** are only On Time or Late (Doc 4 §3.1, ruled 2026-07-09).
- **In the playground**, the predictive half is a stand-in. "The predictive half of the SLA engine — Doc 4 §6.2 assigns it to engineering; the 70% At-Risk threshold is a documented placeholder" (Session 2026-09-08 prompt).
- **Summary cards** above the table (Doc 1 §3.5, added 2026-09-30) show Unassigned, Dispatched and Finished. Each has Delayed and At Risk numbers (or Late and On Time for Finished) that filter the table in one click.

**d) Decisions**
- **Strategic:**
  - Measure each stage, not just one total (Doc 4 §1).
  - The prediction engine and how often it recalculates belong to engineering (Doc 4 §6.2).
- **Tactical:**
  - A constant total with paused clocks (2026-07-08).
  - A single stage breach makes an order Delayed (2026-07-08).
  - Finished orders are On Time or Late only (2026-07-09).
  - Summary-card numbers are one-click shortcuts (2026-09-30, commit `ef1fdcd`).
  - Each phase can be switched off under "Time Targets" (2026-10-21, Doc 4 §1.4).
- **Micro:**
  - The SLA result moves into the Status cell, with tooltips like "Delivered beyond the 40m fulfilment target" (2026-08-18, `a1328ee`, design-decisions #17).
  - "OFT never appears in the interface" (Doc 1 §3.5).
  - Tooltip copy reads "{State} deliveries: {n}" (ruled 2026-10-17).
  - Card titles drop "Orders" (ruled 2026-10-14).
  - The active timer uses tabular figures (Session 2026-08-11).

**e) Reversals**
- The chain-adjusted draft was replaced (2026-07-08, Doc 4 v1.1).
- The cards became one strip with no shadow on 2026-10-27, after Neutral Drop Shadow 1 had been added on 2026-10-16 (Doc 1 §3.5 "revised 2026-10-27"; design-decisions #43).
- The Cancelled, Failed and Delivered cards merged into Finished on 2026-11-04 (Doc 1 §3.5).
- Clicking an active SLA number no longer clears it (2026-10-18, design-decisions #51).

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- `docs/design-decisions/img/status-filter-before.jpg` and `deliveries-toolbar-after.jpg`.
- Commits: before `2db0878`, after `ef1fdcd`.

**h) Sources**
- Doc 4 §1, §1.2, §1.4, §3, §3.1, §6, revision history; Doc 1 §3.5.
- design-decisions #1, #17, #43, #51.
- Sessions 2026-08-05, 08-11, 09-08.

### 2.1 Notifications as a ledger, and grouped alerts that open the exact orders

**a) Problem**
- "The panel was a capped list rebuilt on the fly: 'Unread / Read' tabs, reading something counted as dealing with it, and nothing aged out" (design-decisions #3).
- A grouped alert ("Deliveries to 17 recipients are delayed") offered View Order, which opened one of the seventeen (design-decisions #4).

**b) Options considered**
- Unread/Read tabs, dropped for Open/Resolved (design-decisions #3).
- Not found: other options.

**c) What was built**
- Each notification opens when its condition arises and resolves when it ends. It has Open and Resolved tabs, and reading something is not the same as resolving it.
- The bell counts only what is unread and still open. Resolved items disappear after 48 hours. Source: Doc 10 §5–§9; design-decisions #3.
- At two or more orders, a grouped alert's button reads "Show in Deliveries" and opens the table filtered to exactly those orders (Doc 10 §4.4; design-decisions #4).
- In Ifeanyi's brief for this work (Session 2026-10-14): "something needs you", not "something happened". When the count reaches zero, the badge disappears.

**d) Decisions**
- **Strategic:** notifications become a record of what still needs action (Doc 10 v1.0).
- **Tactical:**
  - Open / Resolved, and read is not resolved.
  - Grouped alerts lead to the table (2026-10-15/16).
  - Dispatchers and depot managers see their own depots; admins see all (Session 2026-10-14, item 8).
- **Micro:**
  - The bell counts unread and open only.
  - Copy uses the SLA states (design-decisions #3).

**e) Reversals**
- Doc 10 v1.3 (2026-11-24): "a single delayed delivery is 'critically delayed'" and "Delivery returned reads 'Your delivery to…'". This reverses the 2026-10-14 rule "never 'critically', never 'Your'" (design-decisions #3).
- Reason: Doc 10 v1.3 says the Notification component set was "ruled 2026-11-13: its copy wins". Not found: why the component copy won.

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- `docs/design-decisions/img/notifications-ledger-before.jpg`, `notifications-grouped-before.jpg` and `notifications-grouped-after.jpg`.
- Commits: before `579272d`, after `2ba43fc`; `681c50f`, `00b2592`.

**h) Sources**
- Doc 10 §4–§9 and revision history; design-decisions #3, #4.
- Commits `d4bcfe6` (2026-10-14), `2ba43fc` (2026-10-15), `681c50f` (2026-10-16).
- Session 2026-10-14.

### 2.2 The Broadcast tab and broadcast status

**a) Problem**
- The logs used "failed / unsuccessful" wording (design-decisions #15).
- Banners didn't say why a broadcast wouldn't happen ("instead of a bare 'You can assign a driver'", design-decisions #22).
- Ifeanyi found the broadcast logic contradicting itself. Session 2026-08-04: "the order was manually assigned to Peter kamau. But in image 2, it says the order was automatically broadcasted to peter kamau before being reassigned to peter kamau again. This doesn't make sense."

**b) Options considered**
- Continuing the same timeline on a re-broadcast was ruled out on 2026-08-07 in favour of a new Batch ID (Doc 1 §7.5.1).
- "a re-broadcast produces a second sequence whose rounds simply continue the same timeline" was withdrawn.
- Session 2026-08-07: Ifeanyi's earlier reply ("I'd continue the same batch rather than starting a fresh one") was later replaced by this ruling.

**c) What was built** (Doc 1 §7.5)
- **A broadcast sequence:** rounds through priority driver groups (P1, P2…), with an optional pre-offer in round 1 and an optional closing fallback round to every nearby driver (§7.5.1, ruled 2026-08-03).
- **Seven content states:** On Hold, Broadcasting, Completed, Fallback, Exhausted, Manually Dispatched (before and after exhausted), and Stopped/Paused (§7.5.2).
- **When no driver accepts:** an Error banner reads "Broadcast not accepted. Try assigning the order directly to a driver or broadcast it again." It offers Re-broadcast (confirmed first) and Assign Driver.
- **The status card** has the status as its title, for example "Broadcasting to In-house drivers [P1]" (2026-09-28, `ae4614e`, design-decisions #32).
- **Notified Driver Cards** show per-driver timestamps (2026-10-06, `2b0b95a`).
- **Notifications:** "Broadcast unaccepted" is an event (Doc 10 v1.3).

**d) Decisions**
- **Strategic:** a re-broadcast is a new sequence with a new Batch ID, and the Activity tab keeps the full history (2026-08-07).
- **Tactical:**
  - Confirm before a re-broadcast because it clears the logs (§7.5.1).
  - A marketplace company gets Re-broadcast only (§7.5.2).
  - Broadcast settings belong to the depot, not the company (§7.5.1).
  - Depot pauses are capped at 30 minutes (Session 2026-09-22; Doc 7 §5).
- **Micro:**
  - "not accepted", never "failed" or "unsuccessful" (ruled 2026-10-06).
  - Every drill-down link shows its count, for example "Notified Drivers (8)" (2026-10-06).
  - Banners name why a broadcast won't run (2026-09-07, `08d5654`).
  - The status is the card title (2026-09-28).
  - The acceptance timer counts down (see f).

**e) Reversals**
- The re-broadcast timeline rule (2026-08-07).
- The On Hold title changed from a "starts in {N} minutes" countdown to "Broadcast starts at {time}" (ruled 2026-10-06, §7.5.2).
- Doc 10 renames "Broadcast not accepted" to "Broadcast unaccepted" (2026-11-24).

**f) Feedback or results**
- Session 2026-09-14:

  > "The feedback i got from a big user was that rather than the counter moving forward, it would make more sense if it was a countdown. Meaning if the acceptance window is 30s and 5 seconds have passed the counter label should read "25s left" instead of "5s elapsed"."

  Who the user was is not recorded.

**g) Before/after candidates**
- Commits `2b0b95a` (2026-10-06), `ae4614e` (2026-09-28), `08d5654` (2026-09-07).
- No before/after images in `docs/design-decisions/img/` for this step.

**h) Sources**
- Doc 1 §7.5.1, §7.5.2, §9.1.2; Doc 5; Doc 7 §5; Doc 10 v1.3.
- design-decisions #15, #22, #32.
- Sessions 2026-08-04, 08-07, 09-14, 09-22.

### 2.3 Dispatching with context

**a) Problem**
- "Assign Driver offered drivers already at 5 of 5, drivers mid drop-off, and busy drivers on accounts where en-route pickup is off" (design-decisions #7).

**b) Options considered**
- Showing drivers on a trip as disabled, dropped for hiding them: "A driver on a trip is hidden, not disabled, and nobody 'nearly done' is offered — when they will finish cannot be predicted" (Doc 1 §10.8).
- "Must be Available", which "the picker never actually applied", was replaced (Doc 1 §10.2).

**c) What was built**
- One rule shared by every driver picker (`selectableDrivers`).
- A driver holds at most one trip. Session 2026-10-06: "A driver holds at most one trip, always."
- A driver already on a trip can take more orders only when all three hold (Doc 1 §10.8):
  - (a) the orders stay within the capacity limit (§10.7, added 2026-08-05);
  - (b) en-route pickup is on;
  - (c) the driver is still within reach of the depot.
- Drivers on their way show a live countdown and a "will not be available once beyond the pickup zone" warning (Doc 1 §10.8).
- Change Driver for an order in transit is allowed only while the pickup-zone test passes (Doc 7 §4, ruled 2026-09-22).

**d) Decisions**
- **Strategic:** one eligibility rule everywhere (2026-10-06).
- **Tactical:**
  - Hidden, not disabled (Doc 1 §10.8).
  - The pickup-zone test for In Transit (2026-09-22).
  - A capacity limit set per depot (Session 2026-08-06, documented in §10.7).
- **Micro:**
  - The zone warning copy (§10.8).
  - Modal toolbars show a filter count badge and a sort dot (2026-10-15, design-decisions #18).

**e) Reversals**
- The In Transit row in the reassignment table was "—" until 2026-10-05 (Doc 1 §10.1).
- §10.3's earlier default for Add To Trip was replaced on 2026-10-06 (§10.8).

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- Commit `36326d9` (2026-10-06), before `d9fff3b`.
- design-decisions #7 notes no screenshot: "the difference is which names appear".

**h) Sources**
- Doc 1 §10.1, §10.2, §10.7, §10.8; Doc 7 §4.
- design-decisions #7, #18.
- Sessions 2026-08-06, 10-06.

---

## SECTION 3: DOING EVERYDAY TASKS FASTER

### 3.0 Acting from the table

**a) Problem**
- "Before, only an edit button at the end of the row worked": **Not found** in the docs, specs, git or sessions.
- What is recorded:
  - Right-click was missing until 2026-08-10. Session 2026-08-10: "When i right click(on touch pads like Mac books it could be a clicking with two fingers) on a table row, display that row's more menu dropdown overlay on the tapped area."
  - The bulk toolbar stayed on screen with nothing to click after selected orders moved. Session 2026-08-10: "the floating bulk action toolbar still persists but with no buttons to click. This is a bug pls fix it."

**b) Options considered**
- Not found.

**c) What was built**
- Clicking a row opens the order drawer. The checkbox is "the only selection target". Buttons inside cells stop the click so a mis-aimed tap never opens the drawer (Doc 1 §3.1).
- Right-click opens the row's menu (2026-08-10). The row stays pressed while the menu is open (2026-09-02, `8bd04be`). The menu gained "Dispatch ›" (2026-09-08, `266e56e`).
- Selecting rows raises a toolbar with an "N selected" list. Bulk actions are limited to what every selected order allows (Doc 1 §12.9).
- Available actions change with status (Doc 1 §10.1 table; §12.5 per-status menus, verified 2026-07-06).
- **Tooltips that explain blocked actions:**
  - Disabled cards in Add Orders explain why ("TRP-022 is full…", design-decisions #19).
  - Change Driver in the trip footer is "disabled with its reason when not allowed" (design-decisions #9).
  - Not found: a toolbar tooltip that explains a blocked bulk action.

**d) Decisions**
- **Tactical:**
  - Row opens the drawer and the checkbox selects (Doc 1 §3.1).
  - Bulk actions are the overlap of what every selected order allows (§12.9).
  - Mixed Return/Fail selections offer neither (ruled 2026-10-15).
- **Micro:**
  - A right-clicked row stays pressed (2026-09-02).
  - "Dispatch ›" in the right-click menu (2026-09-08).
  - Bulk Reschedule sits in the toolbar's ⋯ menu (§12.9).
  - Buttons in a table row are small (`d992752`, 2026-09-28).
  - Counts in confirm buttons follow one natural-language pattern (Session 2026-07-17).

**e) Reversals**
- Not found.

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- Commits `8bd04be` (2026-09-02) and `266e56e` (2026-09-08).
- design-decisions #23 and #34 have no images.

**h) Sources**
- Doc 1 §3.1, §10.1, §12.5, §12.9.
- design-decisions #9, #19, #23, #34.
- Sessions 2026-08-10, 09-02, 09-08.

### 3.1 Reassigning and rescheduling

**a) Problem**
- "Before, a dispatcher had to move an order back to Pending and then dispatch it again": **Not found** as a description of the old platform.
- What is recorded:
  - Reassignment was one of the usability problems in the old platform (Session 2026-09-02: "from order status filtering, SLA tracking, reassignments and more").
  - In the design, an order whose broadcast goes unaccepted returns to Pending (Session 2026-08-04: "when a broadcast goes unaccepted/is exhausted, the order status will go back to pending").

**b) Options considered**
- Bulk cancel and bulk reschedule were out of scope for the first version, then brought in (Changelog §1: "Previously: OM §11.5 and DES-254 both listed 'bulk cancellation or bulk reschedule' as out of scope for V1").
- Asking for a reason on reassignment was dropped: "Reassignment no longer captures a reason" (Session 2026-10-14). Doc 1 §10: "A reassignment is confirmed, not justified" (ruled 2026-10-14).
- The split between auto-broadcast and managed fleets for Change Driver was withdrawn on 2026-08-17 (Doc 1 §10.2).

**c) What was built**
- **Change Driver** for Assigned, At Depot, and In Transit while the zone test passes. "Multi-select: selecting several orders routes them all to a single destination driver in one operation" (Doc 1 §10.2).
- **Changing the driver of a whole trip** moves the trip with its ID (Doc 1 §10.4; Session 2026-09-18 prompt "Change Driver moves the whole trip").
- **Reschedule** has a manual date field and four quick picks: "+1 hour, +4 hours, +8 hours, tomorrow (same time)" (Changelog §2). It works for one order or many, and shows the count in the heading and button.
- **Date pickers grey out the past** (2026-08-24, `a4e0bea`, design-decisions #6). Pickers reopen on what was applied (2026-09-05, design-decisions #24).

**d) Decisions**
- **Strategic:** bulk cancel and reschedule come into scope (Changelog §1).
- **Tactical:**
  - Many orders go to one driver in one step (§10.2).
  - Reassignment is confirmed, not justified (2026-10-14).
  - Rescheduling a driver-held order warns but does not block (§11.2).
- **Micro:**
  - The quick-pick chips.
  - "Please note that rescheduling will unassign orders from their current drivers." (Changelog §1).
  - The confirmation for Change Driver (Session 2026-08-17): "The order will be reassigned from {old} to {new}. {old} will be notified of the new assignment. Are you sure you want to proceed?"

**e) Reversals**
- Asking for a reason was removed (2026-10-14).
- The fleet split was withdrawn (2026-08-17).
- The bulk scope expanded (Doc 1 v2.7, July 2026).

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- `docs/design-decisions/img/date-picker-before.jpg` and `date-picker-after.jpg`.
- Commit `a4e0bea` (before `3cf8f29`).

**h) Sources**
- Doc 1 §10, §10.2, §10.4, §11.2; Changelog §1–§2.
- design-decisions #6, #24.
- Sessions 2026-08-04, 08-17, 09-02, 09-18, 10-14.

### 3.2 The answer first in the order drawer

**a) Problem**
- "Why an order was cancelled was the last thing you'd find, at the bottom of More Information" (design-decisions #10).

**b) Options considered**
- The reason inside More Information (the earlier placement) moved to a card under the overview (Doc 1 §7.3).
- In July the reason was first asked to sit inside More Information: Session 2026-07-27, "Show cancellation reason in the cancelled order detail overview within more information accordion". On 2026-10-05 it moved to the top.

**c) What was built**
- A "Cancellation reason" card directly under the overview card (2026-10-05, `711ca61`, Doc 1 §7.3).
- The same treatment for Returning and Returned orders (2026-10-07, `aedcda2`, design-decisions #14).
- Return Order became a reason checklist (2026-10-06, `ea5c71a`).
- Proof of delivery (signature and/or photo) appears when the company enables it (Doc 1 §7.3). Session 2026-08-05: "Admins should have the choice to enable signature and/or photo POD."
- The SLA badge in the drawer shows only when it needs attention (design-decisions #21).
- **Activity tab** (Doc 1 §7.4):
  - Filters for All, Events and Comments.
  - Every event is tagged System, Dispatcher or Driver.
  - Comments can be edited for 5 minutes, then lock, with no deletion.
  - Ifeanyi asked for the filter frame on 2026-08-26 ("The "filters' frame is how users should filter the order activity tab").
- Closed comments say which status closed them (2026-10-18, design-decisions #50).

**d) Decisions**
- **Tactical:**
  - Lead with why the order ended (2026-10-05).
  - The Activity tab is a permanent record that a re-broadcast never clears (Doc 1 §7.5.1).
- **Micro:**
  - "Other" is never printed; the note takes its place (design-decisions #10).
  - Pickup Code shows only while a driver holds the order (design-decisions #37).
  - "Cancelled orders cannot be commented on." (design-decisions #50).

**e) Reversals**
- The cancellation reason moved from More Information to the top (2026-07-27, then 2026-10-05).

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- `docs/design-decisions/img/cancel-reason-before.jpg`, `cancel-reason-after.jpg`, `comments-closed-before.jpg` and `comments-closed-after.jpg`.

**h) Sources**
- Doc 1 §7.3, §7.4, §7.5.1.
- design-decisions #10, #14, #21, #37, #50.
- Sessions 2026-07-27, 08-05, 08-26.

### 3.3 Finding orders

**a) Problem**
- "The table had tabs plus a single sub-status per group, so seeing 'Pending and Broadcasted' took two trips" (design-decisions #1).
- "Applied filters were hidden behind a number on the filter button" (#2).
- The table's sort was an icon, and "nothing said how rows were ordered" (#11).

**b) Options considered**
- Tabs with one sub-status, replaced by group split buttons and checklists (#1).
- The earlier ruling that a sort tooltip only ever says "Sort" was reversed (#11, "Reverses the 2026-09-05 ruling").
- Search results opening "over the current page" was withdrawn in favour of opening in Deliveries (Doc 11 v1.0).
- A "/" keyboard shortcut was withdrawn as undecided (Doc 11 v1.0).

**c) What was built**
- **Status filter rebuild** (2026-09-30 rulings, `ef1fdcd`): each group is a split button with a live checklist, and summary-card shortcuts sit above.
- **Selected Filter Control** (2026-10-15, `954fc91`): every applied filter is a removable chip, with Clear Filters. A filter the active group doesn't use is set aside, not lost.
- **Sort:** the button reads "Sort: Created (Newest first)" and every menu uses "{X} first" wording.
- **Columns:** dispatchers choose their own (2026-10-18, #48).
- **Global search** (Doc 11, 2026-10-21, `dd7920e`): finds orders, trips, drivers, depots and settings, filtered by role.

**d) Decisions**
- **Tactical:**
  - Split group buttons and checklists.
  - Filters always visible as chips.
  - Set aside, not drop, a filter when switching groups.
  - Search results open in Deliveries (2026-10-21).
- **Micro:**
  - "Sort: Created (Newest first)".
  - "{X} first" wording.
  - The "Filtered by:" label dropped (2026-10-18, #53).
  - The table opens on "Created: Last 7 Days" (#38).
  - Reset became Clear all, then went back to Reset on 2026-11-07 (#2).

**e) Reversals**
- The sort tooltip ruling (2026-09-05, reversed 2026-10-15).
- Reset → Clear all → Reset (2026-10-15 to 2026-11-07).
- The "Filtered by:" label added 2026-10-15 and removed 2026-10-18.
- Search's "over the current page" and "/" shortcut withdrawn (2026-10-21).

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- `docs/design-decisions/img/status-filter-before.jpg`, `deliveries-toolbar-before.jpg`, `deliveries-toolbar-after.jpg`, `columns-before.jpg` and `columns-after.jpg`.
- Commits: before `2db0878`, after `ef1fdcd`; before `681c50f`, after `954fc91`.

**h) Sources**
- Doc 1 §3.3, §12.1–§12.4; Doc 3 §9.2–§9.4; Doc 11 v1.0.
- design-decisions #1, #2, #11, #38, #48, #53.

### 3.4 Order creation on one page

**a) Problem**
- Not found: a recorded problem with the old order creation.
- Not found: a recorded time for creating an order. The current portfolio draft says "Creating an order took 3 minutes 22 seconds, against a 2-minute target". That figure does not appear in any doc, spec, commit or session in this repo.

**b) Options considered**
- **A step-by-step wizard, dropped.** Doc 1 §4: "Order creation is a single-page drawer, not a wizard. (The wizard pattern is reserved for non-time-sensitive flows with genuine sequential dependencies — depot creation, driver creation — and is deliberately not used here, where dispatchers work under time pressure.)"
- **"The wizard my own research recommended": Not found.** No research recommending a wizard is recorded in this repo.
- **Removed from the form** (Doc 1 §4.5):
  - "Map preview during creation — removed. Geocoding errors are rare enough in practice that the preview cost more attention than it saved."
  - "Save Draft — removed. There is no draft state for created orders."

**c) What was built**
- A single-page drawer. Single column is the default; two columns only for long forms whose fields fall into independent groups (Doc 1 §4.1).
- The Create Order drawer uses two columns. Session 2026-07-11: "The Add Order drawer is supposed to be double column".
- Fields show or hide by company configuration (§4.2).
- Past dates and times are disabled (design-decisions #6).
- Pickup depot is a search field (commit `cbdcb75`, 2026-07-14).

**d) Decisions**
- **Strategic:**
  - No wizard for time-pressured flows (Doc 1 §4).
  - No map preview and no draft (§4.5).
- **Tactical:**
  - Single page.
  - The column count follows length and grouping (§4.1).
- **Micro:**
  - "product" renamed to "items" in the Items section (Session 2026-07-27).
  - Pickup depot as a search field (2026-07-14).

**e) Reversals**
- Not found.

**f) Feedback or results**
- Not found.

**g) Before/after candidates**
- Commit `86cb1b9` (2026-07-11, "Add Order drawer…").
- No images found.

**h) Sources**
- Doc 1 §4, §4.1, §4.2, §4.5.
- Sessions 2026-07-11, 07-27.
- Commits `86cb1b9`, `cbdcb75`.

---

## RESULTS

### Status and adoption

| Fact | Source |
|---|---|
| The playground is deployed on Vercel | `PLAN.md` Phase 3; `vercel.json` |
| Design-system packages are published to npm; every release since 0.2.0 (2026-09-17) | `CLAUDE.md` Publishing, Outstanding |
| An internal product, NickOS, installs `@leta-io/components` and uses SideBar and TopBar from it | `CLAUDE.md` line 264 |
| The work reached the company's GitHub organisation. A pull request was merged there on 2026-10-06, and later work goes through the `leta-web-design-import` branch. | `CLAUDE.md` line 266; Session 2026-10-06 |
| The head engineer would resolve conflicts and merge. Session 2026-10-06: "The head engineer will be the one to resolve the conflicts and merge." | Session 2026-10-06 |

**Not found:**
- Engineering rolling the new orders table or components out across the live product.
- Any part of the redesign being in production for dispatchers.

### Goal stated, not result

Session 2026-09-02:

> "One of the goals is to demo the new UI with a selected crop of testers from Leta's user base and validate features and user flows faster and better before engineering needs to write a single line of code."

Not found: a record that this testing happened.

### What people said

- **A large customer**, quoted in Ifeanyi's words, not verbatim (Session 2026-09-14): "The feedback i got from a big user was that rather than the counter moving forward, it would make more sense if it was a countdown."
- **An engineer** on the NickOS project (Session 2026-09-09) said DESIGN.html should stay a living reference. This is about NickOS, not the dispatcher dashboard.
- **Not found** in this repo or its sessions:
  - The two quotes in the current portfolio draft ("I now understand what's happening with an order in chronological order…" and "I spend most of the day in front of the screen…"). The second relates to dark mode (shipped 2026-08-23), but its source is not recorded here.
  - Any other verbatim feedback from dispatchers, ops or engineering.

### Metrics

Not found: any measured result. The current portfolio draft shows 98% task success rate, +20% order fulfilment and 100+ components.
- No source in this repo or its sessions mentions task success or order fulfilment.
- The component count is confirmed (108 component folders).

---

## KEY TAKEAWAYS

### AI drift

See the drift table in 1.1, with dated examples on 2026-07-20, 07-21, 08-12, 09-11, 09-17 and 11-19. The fixes recorded:
- The parity skill (2026-07-15).
- "verify!, verify!, verify!" (2026-07-15).
- Stop and ask when code and spec disagree (2026-10-02).
- Mock-data audits that fail the build (by 2026-09-18).
- Conventions written into docs (2026-11-19).
- Session 2026-08-11, on the agent explaining a tooling trap: "I like the fact that you mentioned this. I'd say this is one of my biggest learnings so fa" (the message is cut off in the transcript).

### Collaboration

**How many times the orders table was rebuilt.** No count is recorded anywhere. These are the dated structural changes to the orders table:

| Date | Change | Source |
|---|---|---|
| 2026-07-05 | First table in the playground | `0cfa00c` |
| 2026-07-11 | "Add Order drawer, config-driven accounts, SLA cells, table-parity" | `86cb1b9` |
| 2026-07-15 | Filter Group wiring and skeleton loading | `d4e742b` |
| 2026-08-18 | Default sort; the SLA result moves into the Status cell | `d7b7c6c`, `a1328ee` |
| 2026-09-30 to 10-02 | Status filter rebuild with summary cards ("Deliveries rebuild" in the 2026-10-06 session handoff) | `ef1fdcd` |
| 2026-10-15/16 | Selected Filter Control and sort wording | `954fc91` |
| 2026-10-18 | Dispatchers choose their columns | design-decisions #48 |
| 2026-10-27 | Summary cards become one strip | Doc 1 §3.5 |
| 2026-11-04 | Finished card merge | Doc 1 §3.5 |

The reasons for each are in their entries above. Not found: any reason given as "engineering said" or a technical limit raised by engineering.

**Weekly demos surfacing limits nobody had scoped:** Not found. No mention of weekly demos or reviews with engineering in the sessions or docs.

**Token spend or wasted effort:**
- Not found: any mention of token spend or usage costs.
- Two related notes:
  - Session 2026-08-05 prompt: "Do not begin visual design until I approve the grouping — restructuring after UI is built is expensive; restructuring a list is not."
  - Session 2026-08-11, the agent's note that a tooling trap "cost me several cycles".

### What changed afterwards

- **Daily check-ins with the manager and engineering leads:** Not found.
- **Updates for the manager:** a company-wide write-up requested on 2026-09-02, and a weekly summary requested on 2026-09-21 ("give me structured text i can send to my manager on what we've done so far in the last week").
- **Confirming before changing the design system or a flow:** the sessions record standing rules with the coding agent, not with people:
  - Session 2026-10-21: "Never publish to npm or write to the Figma Library without my explicit go-ahead".
  - Session 2026-11-04: "Ask before writing to the Library or publishing to npm".
- **Coordinating with the NickOS engineer before breaking changes:** "coordinate before publishing" (`CLAUDE.md` line 264).
- **The specs made shareable:** Session 2026-07-19, "I want to give my claude chat design co-pilot access to all the specs being used to build out the interactive playground".

---

## Decisions by level

### Strategic
- 1.0 Build the design system in code first, mirroring Figma, before the playground.
- 1.0 Keep the repo private; publish only the built packages to npm.
- 1.1 Specs in the repo are the source of truth.
- 1.1 Build the playground only from library components.
- 2.0 Measure five stage targets, not one total.
- 2.0 The prediction engine belongs to engineering.
- 2.1 Notifications become a record of what still needs action.
- 2.2 A re-broadcast is a new sequence with a new Batch ID; Activity keeps everything.
- 2.3 One driver-eligibility rule for every picker.
- 3.1 Bulk cancel and bulk reschedule brought into scope.
- 3.4 No wizard for order creation.
- 3.4 No map preview and no draft in order creation.

### Tactical
- 1.0 Tokens generated from Figma; CI fails on drift.
- 1.1 Four-step parity process (list, present, build, verify).
- 1.1 Stop and ask when code and spec disagree.
- 2.0 Constant total with paused clocks.
- 2.0 One stage breach makes an order Delayed.
- 2.0 Finished orders are On Time or Late only.
- 2.0 Summary-card numbers are one-click filters.
- 2.0 Each phase of time targets can be switched off.
- 2.1 Open / Resolved; read is not resolved.
- 2.1 Grouped alerts open the exact orders in Deliveries.
- 2.1 Notifications scoped to the user's depots.
- 2.2 Confirm before re-broadcast.
- 2.2 Marketplace companies get Re-broadcast only.
- 2.2 Broadcast settings belong to the depot.
- 2.2 Depot pauses capped at 30 minutes.
- 2.3 Busy drivers hidden, not disabled.
- 2.3 Pickup-zone test for reassigning in transit.
- 2.3 Capacity limit per depot.
- 3.0 Row opens the drawer; the checkbox selects.
- 3.0 Bulk actions are the overlap of what every selected order allows.
- 3.0 Mixed Return/Fail selections offer neither.
- 3.1 Many orders to one driver in one step.
- 3.1 Reassignment confirmed, not justified.
- 3.1 Rescheduling a driver-held order warns, doesn't block.
- 3.2 Lead with why the order ended.
- 3.2 Activity is a permanent record.
- 3.3 Split group buttons with checklists.
- 3.3 Filters always visible as chips.
- 3.3 A filter is set aside, not lost, when switching groups.
- 3.3 Search results open in Deliveries.
- 3.4 Single-page drawer; column count follows length and grouping.

### Micro
- 1.0 Outlined icons by default.
- 2.0 SLA result in the Status cell, with tooltips.
- 2.0 "OFT" never shown.
- 2.0 "{State} deliveries: {n}" tooltips.
- 2.0 Card titles drop "Orders".
- 2.0 Tabular figures on the timer.
- 2.1 The bell counts unread and open only.
- 2.1 Copy uses the SLA states.
- 2.2 "not accepted", never "failed".
- 2.2 Counts on drill-down links.
- 2.2 Banners name why a broadcast won't run.
- 2.2 The status is the card title.
- 2.2 The acceptance timer counts down.
- 2.3 Zone warning copy.
- 2.3 Filter count badge and sort dot in modals.
- 3.0 A right-clicked row stays pressed.
- 3.0 "Dispatch ›" in the right-click menu.
- 3.0 Bulk Reschedule in the ⋯ menu.
- 3.0 Small buttons in table rows.
- 3.0 Consistent count wording on bulk confirm buttons.
- 3.1 Reschedule quick picks.
- 3.1 Unassign warning copy.
- 3.1 Change Driver confirmation copy.
- 3.2 "Other" never printed.
- 3.2 Pickup Code only while a driver holds the order.
- 3.2 Closed-comment copy.
- 3.3 "Sort: Created (Newest first)".
- 3.3 "{X} first" wording.
- 3.3 "Filtered by:" label dropped.
- 3.3 Opens on Last 7 Days.
- 3.3 Reset / Clear all.
- 3.4 "items" instead of "product".
- 3.4 Pickup depot as a search field.

---

## Gaps

### Overview
- A start date that confirms the 9-month timeline.
- "3 weeks" for the design system: the records show about 4.5 weeks (2026-05-23 to 2026-06-24).
- "Six specs": there are 14 spec files.
- "Three skills": there are four.

### Section 1
- 1.0 The state of the partial Figma library before the rebuild.
- 1.0 Why no off-the-shelf library was used.
- 1.0 Why the work didn't wait for engineering.
- 1.0 Engineers' feedback on the design system.
- 1.1 Other options for how specs were managed.
- 1.1 Feedback from others on the specs or skills.

### Section 2
- 2.0 A single 40-minute timer as a rejected option. The recorded rejected option is the chain-adjusted total.
- 2.0 Feedback on the summary cards or badges.
- 2.1 Why the component copy reversed "never 'critically', never 'Your'".
- 2.1 Feedback on the notifications.
- 2.3 Feedback on dispatching.

### Section 3
- 3.0 Old platform: only an edit button at the end of the row worked.
- 3.0 Tooltips that explain blocked bulk actions in the selection toolbar.
- 3.0 Options considered and feedback for acting from the table.
- 3.1 Old platform: reassigning meant moving an order back to Pending and dispatching again.
- 3.1 Feedback on reassigning and rescheduling.
- 3.2 Feedback on the order drawer.
- 3.3 Feedback on finding orders.
- 3.4 A recorded problem with the old order creation, and the 3m 22s order-creation time.
- 3.4 Research that recommended a step-by-step wizard.
- 3.4 Reversals and feedback for order creation.

### Results
- Engineering rolling the orders table or components out across the live product.
- Anything in production for dispatchers.
- Testing with users from Leta's customer base.
- Verbatim quotes from dispatchers, ops or engineering, and the source of the two quotes in the current portfolio draft.
- Any measured metric (98% task success rate, +20% order fulfilment).

### Key takeaways
- A recorded count of orders-table rebuilds.
- Reasons given as engineering limits.
- Weekly demos surfacing unscoped limits or workflows.
- Token spend.
- Daily check-ins with the manager and engineering leads.
