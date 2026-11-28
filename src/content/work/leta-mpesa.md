---
# Same copy and images as the Leta case study (Figma "Inner Page" 4192:24706), shown here until this
# case study's own copy is written.
title: Boosting conversion by simplifying delivery booking and payment in the Leta Express M-Pesa mini-app
name: Leta M-Pesa Mini App
summary: Rebuilding design system components and new features with AI to improve usability and delivery times.
order: 2
tags:
  - Leta Technologies
  - Mobile
facts:
  role: Lead Product Designer
  platform: Mobile
  tools: Claude Code, MCPs, Figma, Jitter
# Labels as in the wireframe. The playbook asks each label to say what it is compared against.
metrics:
  - value: 98%
    label: Task Success Rate
  - value: +20%
    label: Order Fulfilment
  - value: 100+
    label: Components
# Figma M-Pesa draft hero 4307:55907.
hero:
  kind: image
  src: /work/leta-mpesa/hero.webp
  alt: Two screens of the Leta mini app in M-PESA for Business, the Home page with operating hours and a delivery in transit.
overview:
  body: Leta's software helps delivery businesses run their orders. Dispatchers assign each order to a driver and track it until drop-off. Their everyday tasks took too many steps, and testing fixes in Figma was slow. I rebuilt the design system in code with Claude Code, wrote six specs, and built a working prototype dispatchers have tested.
  visuals:
    - kind: image
      src: /work/leta-design-system/overview.webp
      alt: The order map showing a driver heading to the drop-off, beside a Trip started card.
problem:
  # Not in the wireframe yet. Earlier draft: "Things move fast at Leta, and building interactive
  # prototypes in Figma was slowing design to developer handoff. Under that sat a dispatcher platform
  # built around data, not workflows: order creation took 3m 22s against a 2-minute target."
  findings:
    - icon: eye-off
      title: Visibility issues
      body: The platform hid trouble - nothing warned a dispatcher that an order was delayed, or that an order broadcasted to nearby drivers was not accepted and activity logs were difficult to scan.
    - icon: zap-off
      title: Inefficient workflows
      body: Dispatchers' most common tasks were slow. Creating an order took 3 minutes 22 seconds, against a 2-minute target. Delivery routes were not visible so this made it harder to plan deliveries.
    - icon: phone-off
      title: Response failure
      body: Dispatchers had zero visibility on unassigned or delayed orders. They also had no way to quickly reassign drivers or act on multiple orders within trips.
  hmw: How might we give dispatchers the ability to predict and act on delays before customers feel them?
  hmwImage: /work/leta-design-system/hmw-illustration.webp
  visuals:
    - kind: image
      src: /work/leta-design-system/journey.webp
      alt: Two user journey maps, for routine monitoring of orders and drivers and for handling order delays.
      caption: User Journey Mapping
# Earlier step drafts, before the wireframe (kept for the copy pass):
# - Rebuilt the design system first, as the base for everything after.
# - Wrote six specs that bake in behaviour: tables that hold different data types, how flows connect,
#   what stops working when a toggle is off, and how the order management pieces fit together.
# - Built three Claude Code skills and the playground. AI executed. Every decision, review, and QA
#   pass stayed with me.
# - Product decisions to pick from: notifications as a ledger, depot as a filter, single-driver
#   dispatch, killing the order creation wizard.
sections:
  - title: How I built it
    steps:
      - title: Rebuilding the design system before redesigning a single screen
        body: Dispatchers needed a full view of operations. They had to quickly identify depots with unassigned orders and whether those orders were slightly delayed, or critically delayed. They also needed to view the drop-off locations of unassigned orders to determine where deliveries needed to happen. Finally, they required access to live delivery metrics on the map without interrupting the view.
        visuals:
          - kind: image
            src: /work/leta-design-system/built-1-0.webp
            alt: The Dispatch menu with Assisted Dispatch and Assign Driver, the bulk action bar, and the Reschedule Order dialog.
          - kind: image
            src: /work/leta-design-system/older-explorations.webp
            alt: Two earlier login screen explorations.
            caption: Older Explorations
      - title: Specs, skills and an interactive prototype
        body: Dispatchers needed a full view of operations. They had to quickly identify depots with unassigned orders and whether those orders were slightly delayed, or critically delayed. They also needed to view the drop-off locations of unassigned orders to determine where deliveries needed to happen. Finally, they required access to live delivery metrics on the map without interrupting the view.
        visuals:
          - kind: placeholder
          - kind: image
            src: /work/leta-design-system/older-explorations.webp
            alt: Two earlier login screen explorations.
            caption: Older Explorations
  - title: Acting on delays
    steps:
      - title: Rebuilding the design system before redesigning a single screen
        body: Dispatchers needed a full view of operations. They had to quickly identify depots with unassigned orders and whether those orders were slightly delayed, or critically delayed. They also needed to view the drop-off locations of unassigned orders to determine where deliveries needed to happen. Finally, they required access to live delivery metrics on the map without interrupting the view.
        visuals:
          - kind: image
            src: /work/leta-design-system/built-1-0.webp
            alt: The Dispatch menu with Assisted Dispatch and Assign Driver, the bulk action bar, and the Reschedule Order dialog.
          - pair:
              - kind: image
                src: /work/leta-design-system/before.webp
                alt: The old Orders screen, with filters in a long dropdown.
                caption: Before
              - kind: image
                src: /work/leta-design-system/after.webp
                alt: The new Deliveries screen, with depot filters and unassigned and delayed counts.
                caption: After
      - title: Scoped feature specs then built a prototype to test
        body: Dispatchers needed a full view of operations. They had to quickly identify depots with unassigned orders and whether those orders were slightly delayed, or critically delayed. They also needed to view the drop-off locations of unassigned orders to determine where deliveries needed to happen. Finally, they required access to live delivery metrics on the map without interrupting the view.
        visuals:
          - kind: placeholder
          - kind: image
            src: /work/leta-design-system/older-explorations.webp
            alt: Two earlier login screen explorations.
            caption: Older Explorations
  - title: Completing daily tasks faster
    nav: Faster workflows
    steps:
      - title: Acting from the table
        body: Clickable rows (before, only an edit button at the end of the row worked), the right-click menu, multi-select with a toolbar that counts selected orders and explains blocked actions in tooltips, and actions that change with the order's status.
        visuals:
          - kind: image
            src: /work/leta-design-system/built-1-0.webp
            alt: The Dispatch menu with Assisted Dispatch and Assign Driver, the bulk action bar, and the Reschedule Order dialog.
          - pair:
              - kind: image
                src: /work/leta-design-system/before.webp
                alt: The old Orders screen, with filters in a long dropdown.
                caption: Before
              - kind: image
                src: /work/leta-design-system/after.webp
                alt: The new Deliveries screen, with depot filters and unassigned and delayed counts.
                caption: After
      - title: Reassigning and rescheduling
        body: Dispatchers needed a full view of operations. They had to quickly identify depots with unassigned orders and whether those orders were slightly delayed, or critically delayed. They also needed to view the drop-off locations of unassigned orders to determine where deliveries needed to happen. Finally, they required access to live delivery metrics on the map without interrupting the view.
        visuals:
          - kind: placeholder
          - kind: image
            src: /work/leta-design-system/older-explorations.webp
            alt: Two earlier login screen explorations.
            caption: Older Explorations
results:
  title: Feedback
  quotes:
    - text: I now understand what's happening with an order in chronological order. Broadcasting details are much clearer as well.
    - text: I spend most of the day in front of the screen, managing orders and drivers. So dark mode makes it easier for me to work.
takeaways:
  - title: Fast prototyping can't replace early collaboration
    body: |-
      Once I could build screens in hours instead of days, I started polishing flows solo before weekly reviews. Without early input, engineering would catch a technical limit or an unscoped workflow in the room, forcing me to rebuild, like the orders table I redid several times. Building had gotten cheap, yet a B2B product like this still has to be worked out with the people who know how deliveries run and how the system works underneath.

      To bring the engineers and product owners closer to the project, I deployed and shared the interactive prototype and opened the repository for engineers to fork and test in their own sandboxes.
  - title: Building fast showed me how much I was working alone
    body: Dispatchers needed a full view of operations. They had to quickly identify depots with unassigned orders and whether those orders were slightly delayed, or critically delayed. They also needed to view the drop-off locations of unassigned orders to determine where deliveries needed to happen. Finally, they required access to live delivery metrics on the map without interrupting the view.
---
