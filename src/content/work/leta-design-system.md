---
# Copy and images from the Figma wireframe "Inner Page" (4192:24706, Nov 26, 2026; first built from
# 4110:3586). Images are the wireframe's image boxes exported whole at 2x (public/work/leta-design-system/).
title: Rebuilding design system components and new features with AI to improve usability and delivery times.
name: Leta design system
summary: Leta design system, six specs, three Claude Code skills, and a playground prototype. Order creation took 3m 22s against a 2-minute target.
order: 1
tags:
  - Leta Technologies
  - Web
  - B2B
facts:
  role: Lead Product Designer
  platform: Web
  tools: Claude Code, MCPs, Figma, Jitter
# Labels as in the wireframe. The playbook asks each label to say what it is compared against.
metrics:
  - value: 98%
    label: Task Success Rate
  - value: +20%
    label: Order Fulfilment
  - value: 100+
    label: Components
# Screen recording from my-portfolio-materials/Case study 1 preview.MOV (1440 wide, no sound).
hero:
  kind: video
  src: /work/leta-design-system/preview.mp4
  webm: /work/leta-design-system/preview.webm
  poster: /work/leta-design-system/preview-poster.jpg
  screen: true
  alt: Selecting an order in the redesigned Deliveries table, which brings up the bulk action bar.
overview:
  body: "Leta helps delivery businesses run their orders. Dispatchers assign each order to a driver and track it until drop-off. The platform made them dig: order status was hard to filter, delivery time targets were hard to track, and reassigning a driver took too many steps. I rebuilt Leta's design system in code from the Figma library, wrote the specs for every flow, and built a working prototype of the dispatcher dashboard on top of it, so ideas could be tested before engineering wrote any code."
  visuals:
    - kind: image
      src: /work/leta-design-system/overview.webp
      alt: A date and time picker, driver sort options and a Trip started card beside the live order map.
      # The map is the Login page's looping order map (LETA SignInMapPicture), placed as in Figma
      # 4192:24739: 488 square at 45, 32 in the 1024 x 400 box, cropped at the bottom.
      overlay:
        src: /work/leta-design-system/order-map.webp
        still: /work/leta-design-system/order-map-still.webp
        alt: A driver heading to the drop-off on the live order map.
        x: 4.395
        y: 8
        w: 47.656
        ratio: 1
problem:
  findings:
    - icon: eye-off
      title: Visibility issues
      body: The platform hid trouble - nothing warned a dispatcher that an order was delayed, or that an order broadcasted to nearby drivers was not accepted and activity logs were difficult to scan.
    - icon: zap-off
      title: Inefficient workflows
      body: Dispatchers' most common tasks were slow. Creating an order took 3 minutes 22 seconds, against a 2-minute target. Delivery routes were not visible so this made it harder to plan deliveries.
    - icon: phone-off
      title: Response failure
      body: Dispatchers struggled to adapt when there were issues. Reassigning orders between drivers involved a cumbersome process that took over two minutes and didn’t notify the original driver.
  hmw: How might we let dispatchers see which orders need attention before customers feel the delay, and act on them in as few steps as possible?
  hmwImage: /work/leta-design-system/hmw-illustration.webp
  visuals:
    - kind: image
      src: /work/leta-design-system/journey.webp
      alt: Two user journey maps, for routine monitoring of orders and drivers and for handling order delays.
      caption: User Journey Mapping
sections:
  - title: How I built it
    steps:
      - title: Rebuilding the design system before redesigning a single screen
        body: Leta's brand assets, components, rules and flows were spread across different tools and dozens of Figma links, which made handoff to engineering and demos to customers hard. Rather than redesign screens on that footing, I rebuilt the design system in code first, mirroring the Figma library. Tokens are generated straight from Figma variables, and a check fails the build if code and Figma drift apart. In about four and a half weeks the library grew to over 100 components with light and dark themes, documented in Storybook and published to npm, where another internal product now installs it.
        visuals:
          - kind: image
            src: /work/leta-design-system/components.webp
            alt: Leta components - colour palette, input fields, buttons, checkboxes and radios, badges, segment control, loaders, logos, illustrations and search.
            caption: Over a 100 components shipped
          - kind: compare
            alt: A row menu, a Delayed tooltip, a driver card and the Reschedule Order dialog, in light mode and dark mode.
            caption: Drag the handle
      - title: From Figma to code with Claude
        body: To avoid drift, I moved fourteen specs into the repository and wrote four Claude Code skills to keep implementation aligned. AI wrote the code; I reviewed every decision. Global search went from brief to working overlay in about six and a half hours.
        visuals:
          - kind: image
            src: /work/leta-design-system/claude-figma.webp
            alt: Building the playground from the Figma library with Claude Code.
  - title: Acting on delays
    steps:
      - title: Identifying delayed and at-risk deliveries.
        body: Nothing on the orders page said how many orders were late. Order fulfilment is split into five stage targets, from assignment to drop-off, that add up to one total for every order. With single and multi order trips, delays are flagged as soon as one stage runs over. An order is flagged as “At Risk” when the driver's live position & speed predicts a miss.
        visuals:
          - kind: video
            demo: true
            src: /work/leta-design-system/demo-delays.mp4
            webm: /work/leta-design-system/demo-delays.webm
            poster: /work/leta-design-system/demo-delays.jpg
            alt: Hovering the Delayed and At Risk icons in the Deliveries table, then opening each order to see its delay banner.
            caption: Identifying delayed orders
          - kind: image
            src: /work/leta-design-system/time-targets.webp
            frames:
              - { src: /work/leta-design-system/shot-time-targets.webp, x: 201, y: 20, w: 623 }
            alt: Time Targets settings, with a target for each delivery stage.
            caption: Configuring time targets
      - title: Notifications to stay ahead
        body: "Notifications were non-existent so I built the it as a ledger: each notification opens when a problem starts and resolves when it ends, with Open and Resolved tabs, so a read notification never marks as done. The bell counts only what is unread and still open. I also introduced Grouped alerts which opens the table filtered to exactly those orders, so the count in the alert matches the count in the table."
        visuals:
          - kind: video
            demo: true
            src: /work/leta-design-system/demo-notifications.mp4
            webm: /work/leta-design-system/demo-notifications.webm
            poster: /work/leta-design-system/demo-notifications.jpg
            alt: Opening the notifications panel, filtering it to unread, and showing a grouped delay alert's orders in the Deliveries table.
          - kind: image
            src: /work/leta-design-system/notification-types.webp
            alt: Four versions of the notifications panel, with a leading icon for each event type.
            caption: "Leading icons identify notification event types. A dropdown replaced the toggle to support three filters: all, read, and unread"
      - title: Visualizing events & broadcast logs
        body: When orders are broadcast to drivers, dispatchers struggle to track their status. The log details were hard to read, and didn’t explain unaccepted broadcasts. I revamped the activity tab to log an order’s history, while the broadcast tab shows current and past rounds. It also lists driver groups, notified drivers, and broadcast duration. If no one accepts, the dispatcher rebroadcasts & assign it manually to an available driver.
        visuals:
          - kind: video
            demo: true
            src: /work/leta-design-system/demo-broadcast.mp4
            webm: /work/leta-design-system/demo-broadcast.webm
            poster: /work/leta-design-system/demo-broadcast.jpg
            alt: Filtering to broadcasted orders, opening one, and following its broadcast logs, driver groups and notified drivers until a driver accepts.
          - kind: image
            src: /work/leta-design-system/broadcast-states.webp
            frames:
              - { src: /work/leta-design-system/shot-broadcast-1.webp, x: 23, y: 103, w: 310 }
              - { src: /work/leta-design-system/shot-broadcast-2.webp, x: 357, y: 103, w: 310 }
              - { src: /work/leta-design-system/shot-broadcast-3.webp, x: 691, y: 103, w: 310 }
            alt: Three order drawers showing different broadcast states.
            caption: Snapshots of the various order broadcast states
  - title: Faster workflows
    steps:
      - title: Acting from the table
        body: I enabled the entire table row to open the order, kept the selection checkbox, and prevented buttons in a cell from mistakenly opening the drawer. Right-clicking a row shows the same actions as its menu. Selecting multiple orders brings up a toolbar to manage selections and view actions allowed for all selected orders.
        visuals:
          - kind: video
            demo: true
            src: /work/leta-design-system/demo-table-actions.mp4
            webm: /work/leta-design-system/demo-table-actions.webm
            poster: /work/leta-design-system/demo-table-actions.jpg
            alt: Copying an order ID, cancelling selected orders, rescheduling, and dispatching an order directly to an eligible driver.
          - kind: video
            demo: true
            src: /work/leta-design-system/demo-trips.mp4
            webm: /work/leta-design-system/demo-trips.webm
            poster: /work/leta-design-system/demo-trips.jpg
            alt: Opening a trip with several orders from the table and expanding its map.
          - kind: image
            src: /work/leta-design-system/trip-progress.webp
            alt: Three trip drawers showing trip progress.
            caption: Trips can contain up to 50 orders, making a segmented progress bar too crowded. A continuous bar was also dropped because adding orders could decrease the progress shown.
      - title: Improved search & filtering
        body: I revamped the order status filtering with group buttons, each with a checklist of statuses, and showed every applied filter as a chip you can remove in one click. Sorting is aligned how table data is arranged ("Created, newest first"), and a global search finds orders, trips, drivers, depots and settings from any page.
        visuals:
          - kind: video
            demo: true
            src: /work/leta-design-system/demo-search-filter.mp4
            webm: /work/leta-design-system/demo-search-filter.webm
            poster: /work/leta-design-system/demo-search-filter.jpg
            alt: Finding an order by recipient in global search, then filtering the table to at-risk orders, statuses, a recipient and a depot.
          - pair:
              - kind: image
                src: /work/leta-design-system/search-before.webp
                box: [502, 400]
                frames:
                  - { src: /work/leta-design-system/shot-search-before.webp, x: 43, y: 24, w: 669, vis: 0.6861 }
                alt: The old Orders screen, with status filters in a long dropdown.
                caption: Before
              - kind: image
                src: /work/leta-design-system/search-after.webp
                box: [502, 400]
                frames:
                  - { src: /work/leta-design-system/shot-search-after.webp, x: 60, y: 40, w: 645, vis: 0.6853 }
                alt: The new Deliveries screen, with group filters and More filters open.
                caption: After
      - title: Simplified order creation
        body: "Usability testing showed that when store or order integrations fail, dispatchers enter orders manually under pressure. I chose a two-column drawer: most fields stay visible, with no fixed entry order. Required-field markers, input guidance, and inline validation help catch mistakes. Average time to add an order fell from 3 minutes 22 seconds to 1 minute 24 seconds, beating the 2-minute target."
        visuals:
          - kind: video
            demo: true
            src: /work/leta-design-system/demo-create-order.mp4
            webm: /work/leta-design-system/demo-create-order.webm
            poster: /work/leta-design-system/demo-create-order.jpg
            alt: Creating an order in the two-column drawer, with inline validation and the discard confirmation.
          - pair:
              - kind: image
                src: /work/leta-design-system/create-before.webp
                box: [502, 400]
                frames:
                  - { src: /work/leta-design-system/shot-create-before.webp, x: 31, y: 65, w: 440 }
                alt: The old Add Order form.
                caption: Before
              - kind: image
                src: /work/leta-design-system/create-after.webp
                box: [502, 400]
                frames:
                  - { src: /work/leta-design-system/shot-create-after.webp, x: 31, y: 65, w: 440 }
                alt: The new two-column Create Order drawer.
                caption: After
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
