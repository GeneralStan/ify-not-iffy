# Suggested body copy: the Leta dispatcher dashboard case study

Draft copy for the portfolio page. It follows the case study structure and uses only what `docs/portfolio/case-study-evidence.md` could source. Anything without a source is marked [TBD].

---

## Header

**Title:** Rebuilding Leta's design system and dispatch workflows so dispatchers see problems early and act faster

**Meta:**
- Role: Lead Product Designer and Design Engineer
- Platform: Web
- Tools: Claude Code, Figma, Storybook
- Timeline: [TBD: about 9 months; the dated record runs May to November 2026]

**Impact metrics:**

| Value | Label |
|---|---|
| 108 | components in the coded design system, published to npm |
| 53 | design decisions logged and scored for usability |
| [TBD: a measured result] | [TBD: what it is compared against] |

The current draft also uses 98% task success rate and +20% order fulfilment. No source for either was found in the repo or sessions, so keep them only if you have a measurement elsewhere.

---

## Overview

Leta helps delivery businesses run their orders. Dispatchers assign each order to a driver and track it until drop-off. The platform made them dig: order status was hard to filter, delivery time targets were hard to track, and reassigning a driver took too many steps. I rebuilt Leta's design system in code from the Figma library, wrote the specs for every flow, and built a working prototype of the dispatcher dashboard on top of it, so ideas could be tested before engineering wrote any code.

---

## Defining the problem

**Intro:** Dispatchers work under time pressure, so every extra click or hidden state costs a late delivery.

### What we uncovered

1. **Problems stayed hidden.** Nothing on the orders page said how many orders were running late, and a delayed order looked the same as one on time until it was too late to act. Source: [TBD: name the research or field source].
2. **Common tasks took too many steps.** Seeing two statuses at once took two trips through the tabs, applied filters hid behind a number, and the order creation flow was slow. Source: [TBD].
3. **Acting on a problem was slow.** There was no quick way to reassign several orders or to see which drivers could actually take them. Source: [TBD].

The playbook asks each finding to name its source. Your Sep 2 write-up names "order status filtering, SLA tracking, reassignments" as the platform's main usability issues, but it doesn't say how they were found.

**How might we** let dispatchers see which orders need attention before customers feel the delay, and act on them in as few steps as possible?

---

## Section 1: How I built it

### 1.0 Rebuilding the design system before redesigning a single screen

*Strategic · Consistency and standards*

Leta's brand assets, components, rules and flows were spread across different tools and dozens of Figma links, which made handoff to engineering and demos to customers hard. Rather than redesign screens on that footing, I rebuilt the design system in code first, mirroring the Figma library. Tokens are generated straight from Figma variables, and a check fails the build if code and Figma drift apart. In about four and a half weeks the library grew to over 100 components with light and dark themes, documented in Storybook and published to npm, where another internal product now installs it.

### 1.1 Writing the specs, then building a prototype from them

*Strategic*

Early on I audited specs in separate chats and passed the results back and forth, and the coding agent kept drifting from them. I moved every spec into the repository as the single source of truth: fourteen documents covering orders, time targets, broadcasting, trips, notifications and search. I wrote four Claude Code skills to keep the build honest. One syncs Figma changes into code, another sizes table columns to the spec, a third rebuilds a wireframe and compares screenshots, and a fourth draws the prototype back into Figma. The AI wrote the code; I made and reviewed every decision. Global search went from brief to a working overlay in about six and a half hours.

---

## Section 2: Seeing and acting on what needs attention

### 2.0 Showing which orders are late, and which will be

*Tactical · Visibility of system status*

Nothing on the orders page said how many orders were late. My first model stretched an order's time target for later drop-offs on a trip, but a design walkthrough showed that hid real delays. I dropped it for five stage targets, from assignment to drop-off, that add up to one total for every order, with clocks that pause while an order waits its turn. An order is Delayed as soon as one stage runs over, and At Risk when the driver's live position predicts a miss. Summary cards above the table count both, and each number filters the table in one click.

### 2.1 Notifications that list what still needs you

*Tactical · Visibility of system status*

The notifications panel was a list of what had happened, and reading an alert counted as dealing with it. An alert about 17 delayed deliveries opened just one of them. I rebuilt the panel as a ledger: each notification opens when a problem starts and resolves when it ends, with Open and Resolved tabs, so read never means done. The bell counts only what is unread and still open. A grouped alert now says "Show in Deliveries" and opens the table filtered to exactly those orders, so the count in the alert matches the count in the table.

### 2.2 Making broadcasts readable

*Tactical · Match between system and the real world*

When an order is broadcast to drivers, dispatchers couldn't tell where it stood. The logs said "failed" when no driver had failed, and banners didn't say why a broadcast wasn't coming. I first kept a re-broadcast in the same timeline, then gave each re-broadcast a new batch so the logs only describe the current attempt, while the Activity tab keeps the full history. The Broadcast tab now names the live round and driver group, counts the drivers notified, and says "not accepted". When nobody accepts, it offers Re-broadcast and Assign Driver side by side. After feedback from a large customer, the acceptance timer counts down instead of up.

### 2.3 Only offering drivers who can take the order

*Tactical · Error prevention*

The driver picker offered drivers who were already full, mid drop-off, or out of reach. I considered showing busy drivers as disabled, but nobody can predict when a driver will finish, so hidden is more honest than "nearly free". Every picker now reads one rule. A driver holds at most one trip, and takes more orders only with room under the depot's limit, en-route pickup on, and while still near the depot. Drivers heading to the depot show a countdown and a warning before they leave the pickup zone. [TBD: result or feedback]

---

## Section 3: Doing everyday tasks faster

### 3.0 Acting straight from the table

*Tactical · Flexibility and efficiency of use*

[TBD: confirm the old behaviour, for example "Before, only an edit button at the end of each row did anything".] I made the whole row open the order, kept the checkbox for selecting, and stopped buttons inside a cell from opening the drawer by mistake. Right-clicking a row opens the same actions as its menu, including Dispatch, and the row stays pressed so you can see which one you're acting on. Selecting several orders raises a toolbar that counts them and only offers actions every selected order allows. [TBD: result or feedback]

### 3.1 Reassigning and rescheduling in one step

*Tactical · Flexibility and efficiency of use*

[TBD: confirm the old flow, for example "Before, reassigning meant moving an order back to Pending and dispatching it again".] Bulk cancel and bulk reschedule were out of scope at first; I brought them in because dispatchers handle orders in batches. Change Driver now moves several orders to one driver in one step, or a whole trip with its ID. Reassigning asks for confirmation but no reason, since the dispatcher is fixing a problem, not explaining one. Rescheduling offers four quick picks (+1 hour, +4 hours, +8 hours, tomorrow) and greys out past dates. [TBD: result or feedback]

### 3.2 Putting the answer at the top of the order

*Micro, within a tactical step · Recognition rather than recall*

Why an order was cancelled was the last thing in the drawer, at the bottom of More Information. I moved it to a card directly under the order's overview, and did the same for returned orders, so the drawer answers "what happened?" first. Proof of delivery shows when the company collects it. The Activity tab records every event, tagged by who caused it (system, dispatcher or driver), with comments that lock after five minutes and can't be deleted, so the history holds up when something goes wrong.

### 3.3 Finding the right orders

*Tactical · Visibility of system status*

Seeing Pending and Broadcasted orders together took two trips through the tabs, and applied filters hid behind a number on a button. I replaced the tabs with group buttons, each with a checklist of statuses, and showed every applied filter as a chip you can remove in one click. Switching groups sets aside a filter that doesn't apply rather than losing it. The sort button now says how the table is sorted ("Created, newest first"), and a global search finds orders, trips, drivers, depots and settings from any page.

### 3.4 Creating an order on one page

*Strategic · Flexibility and efficiency of use*

[TBD: the problem with the old order creation, and its measured time if you have it.] A step-by-step wizard was the obvious pattern, but dispatchers create orders under time pressure and the fields have no forced order, so I kept the wizard for slow, dependent flows like adding a depot. Order creation became a single drawer with two columns, so most fields show without scrolling. I also removed the map preview, which cost more attention than it saved, and the draft option, since created orders have no draft state. [TBD: result or feedback]

---

## Results

**Status:**
- The design system is in use: published to npm and installed by another internal Leta product.
- The prototype and the design-system work reached the company's code repository through a pull request merged in October 2026.
- [TBD: whether the redesigned dashboard is in production or being rolled out]

**What people said:**
- A large customer asked for the broadcast timer to count down rather than up, and it now does. This is paraphrased feedback, so it stays out of quote marks.
- [TBD: two or three verbatim quotes, attributed by role and context. The two quotes in the current draft have no recorded source.]

**Projected:** [TBD, or leave out]

---

## Key takeaways

### Fast building needs tight specs

Early on, the coding agent drifted whenever the brief was loose. It built components from a glance at the screens instead of their variants, used the wrong padding and icons, and let the broadcast logic wander from the docs. I fixed it by making the repo's specs the single source of truth, writing a skill that lists everything in a wireframe and compares screenshots before anything ships, and a standing rule: if code and spec disagree, stop and ask.

### Fast prototyping can't replace early collaboration

[TBD: the real moment. The evidence shows the orders table changed structure at least seven times between July and November. It doesn't record that engineering raised a limit in a demo, so name the moment yourself.] What I changed: [TBD: daily check-ins and confirming changes with engineering leads aren't recorded in the sessions. Describe them in your own words if they happened.]
