import * as React from 'react';
import {
  AccordionChevron,
  AccordionContent,
  Avatar,
  Badge,
  Button,
  ContentPrimitives,
  DesktopMenuOptions,
  MenuDivider,
  MenuPanel,
  ModalDialog,
  NotificationBanner,
  OptionCard,
  Select,
  Tooltip,
} from '@leta-io/components';
import { Icon } from '@leta-io/icons';
import type { IconName } from '@leta-io/icons';
// The Leta design tokens and type styles. Every colour token is set under [data-theme], so they
// apply only inside the two scenes below and leave the rest of the site alone.
import '@leta-io/design-tokens/css';
import '@leta-io/design-tokens/text-styles.css';
import '@leta-io/design-tokens/dark-elevation.css';
import '@fontsource-variable/inter/opsz.css';
import ImageCompare from './ui/image-compare';

/**
 * Step 1.0, "Drag the handle" (Figma 4257:35298): the same four Leta components in light mode and
 * dark mode, split by a draggable divider. Built from the published @leta-io/components, laid out
 * on the Figma 1024 x 400 box and scaled with the box width.
 */

const W = 1024;
const H = 400;

/** Where each piece sits in the Figma box (x, y, width): each is scaled to fit its width. */
const SLOTS = {
  menu: { x: 76, y: 18, w: 210 },
  tooltip: { x: 330, y: 18, w: 256 },
  driver: { x: 298, y: 194, w: 310 },
  dialog: { x: 620, y: 18, w: 328 },
} as const;

/** Places a component at its natural size and scales it to the slot width. */
function Fit({ slot, children }: { slot: { x: number; y: number; w: number }; children: React.ReactNode }) {
  const inner = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  React.useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    const measure = () => {
      const natural = node.offsetWidth;
      if (natural) setScale(slot.w / natural);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [slot.w]);
  return (
    <div style={{ position: 'absolute', left: slot.x, top: slot.y, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <div ref={inner} style={{ width: 'max-content' }}>
        {children}
      </div>
    </div>
  );
}

const MENU: { label: string; icon: IconName }[][] = [
  [
    { label: 'View Logs', icon: 'Document' },
    { label: 'Edit Order', icon: 'Edit' },
    { label: 'Add To Trip', icon: 'Add' },
    { label: 'Mark as Pending', icon: 'Pending' },
  ],
  [
    { label: 'Reschedule Order', icon: 'Calendar' },
    { label: 'Add Comment', icon: 'Comment' },
  ],
];

function RowMenu() {
  return (
    <MenuPanel width={220}>
      {MENU.map((group, i) => (
        <React.Fragment key={i}>
          {i > 0 && <MenuDivider />}
          {group.map((item) => (
            <DesktopMenuOptions
              key={item.label}
              type="dropdown-basic"
              label={item.label}
              showLeadingIcon
              leadingIcon={item.icon}
              showChevron={false}
              tabIndex={-1}
            />
          ))}
        </React.Fragment>
      ))}
      <MenuDivider />
      <DesktopMenuOptions
        type="dropdown-destructive"
        label="Cancel Order"
        showLeadingIcon
        leadingIcon="Delete"
        showChevron={false}
        tabIndex={-1}
      />
    </MenuPanel>
  );
}

function DelayedTip() {
  return (
    <Tooltip
      variant="standard"
      platform="desktop"
      width={256}
      caretSide="bottom"
      caretAlign="center"
      // As the playground's SLA tips (lib/slaTip.tsx): a Badge, then the reason.
      text={
        <>
          <Badge color="error" label="Delayed" leadingIcon="Error" />
          <span className="text-label-m-regular" style={{ color: 'var(--text-on-color-label)' }}>
            Driver did not reach the address within the 15-minute target.
          </span>
        </>
      }
    />
  );
}

function Field({ label, value, help }: { label: string; value: string; help?: boolean }) {
  return (
    <ContentPrimitives
      type="vertical-list-row"
      titleName={
        help ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-4px)' }}>
            {label}
            <Icon name="Question" outlined size={16} style={{ color: 'var(--icons-neutral-idle)' }} />
          </span>
        ) : (
          label
        )
      }
      listRowText={value}
      showDescriptionLeadingIcon={false}
      showInteractiveElements={false}
      style={{ flex: '1 0 0', minWidth: 0 }}
    />
  );
}

/** The Assign Driver flow's driver card (playground DriverInfoPopover), expanded. */
function DriverCard() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        width: 360,
        borderRadius: 'var(--rounding-xl)',
        background: 'var(--surface-neutral-bg-default)',
        border: 'var(--stroke-xs) solid var(--border-neutral-default)',
        boxShadow: 'var(--shadow-map-overlay)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-20px)',
          padding: 'var(--padding-16px)',
          borderBottom: 'var(--stroke-xs) solid var(--border-neutral-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)', minWidth: 0, flex: 1 }}>
          <Avatar name="John Mwangi" tone="yankee-blue" size="medium" decorative />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4px)', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)' }}>
              <span className="text-label-m-semibold" style={{ color: 'var(--text-default-heading)', whiteSpace: 'nowrap' }}>
                John Mwangi
              </span>
              <Badge color="neutral" leadingIcon="Star" iconColor="var(--icons-caution-default)" label="5.0" />
            </div>
            <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)', whiteSpace: 'nowrap' }}>
              In house · KMG 234C
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)', flexShrink: 0 }}>
          <Button variant="ghost" size="medium" iconOnly="Phone" iconOutlined aria-label="Call John Mwangi" tabIndex={-1} />
          <AccordionChevron open onToggle={() => undefined} label={{ expand: 'Expand driver details', collapse: 'Collapse driver details' }} />
        </div>
      </div>
      <AccordionContent open topGap="0px" gap="0px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16px)', padding: 'var(--padding-16px)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-16px)' }}>
            <Field label="Phone number" value="+254 740 829 384" />
            <Field label="Assigned orders" value="2 orders" />
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-16px)' }}>
            <Field label="Distance to depot" value="0.1 Km" />
            <Field label="On-time rate" value="95%" help />
          </div>
        </div>
      </AccordionContent>
    </div>
  );
}

const SUGGESTIONS = [
  { title: 'Nov 5 2024, 09:00 AM', description: '1 hour later' },
  { title: 'Nov 5 2024, 12:00 PM', description: '4 hours later' },
  { title: 'Nov 5 2024, 04:00 PM', description: '8 hours later' },
  { title: 'Nov 6 2024, 08:00 AM', description: 'Tomorrow, same time' },
];

/** The Reschedule Order dialog (playground RescheduleModal), with the first suggestion picked. */
function RescheduleDialog() {
  return (
    <ModalDialog
      variant="multi-choice"
      title="Reschedule Order"
      cancelLabel="Close"
      confirmLabel="Reschedule Order"
      confirmIconLeft="Check"
      bodyHeight={440}
      onCancel={() => undefined}
      onClose={() => undefined}
      onConfirm={() => undefined}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24px)', width: '100%' }}>
        <NotificationBanner
          type="warning"
          variant="filled"
          description="Please note that rescheduling will unassign orders from their current drivers."
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8px)' }}>
          <span className="text-body-m-medium" style={{ color: 'var(--text-default-body)' }}>
            Manually reschedule this order
          </span>
          <Select showLabel={false} showHelper={false} leadingFieldIcon="Calendar" value="Nov 5 2024, 08:00 AM" style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8px)' }}>
          <span className="text-body-m-medium" style={{ color: 'var(--text-default-body)' }}>
            Or choose a suggested date &amp; time
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--spacing-8px)' }}>
            {SUGGESTIONS.map((s, i) => (
              <OptionCard
                key={s.title}
                title={s.title}
                description={s.description}
                selected={i === 0}
                showTrailing
                trailing={
                  <Icon
                    name="Check-Circle"
                    outlined={false}
                    size={20}
                    color="var(--icons-neutral-default)"
                    style={{ visibility: i === 0 ? 'visible' : 'hidden' }}
                  />
                }
              />
            ))}
          </div>
        </div>
      </div>
    </ModalDialog>
  );
}

/** One full scene in one theme, at the Figma box size. */
function Scene({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div
      data-theme={theme}
      aria-hidden="true"
      inert
      style={{
        position: 'absolute',
        inset: 0,
        width: W,
        height: H,
        background: theme === 'light' ? 'var(--surface-neutral-bg-subtle)' : 'var(--surface-neutral-bg-alt)',
        fontFamily: 'var(--inter-family)',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Fit slot={SLOTS.menu}>
        <RowMenu />
      </Fit>
      <Fit slot={SLOTS.tooltip}>
        <DelayedTip />
      </Fit>
      <Fit slot={SLOTS.driver}>
        <DriverCard />
      </Fit>
      <Fit slot={SLOTS.dialog}>
        <RescheduleDialog />
      </Fit>
    </div>
  );
}

/** Scales the 1024 x 400 scene to the width it is given. */
function Scaled({ children }: { children: React.ReactNode }) {
  const box = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  React.useLayoutEffect(() => {
    const node = box.current;
    if (!node) return;
    const measure = () => setScale(node.clientWidth / W);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}

export default function LetaThemeCompare() {
  return (
    <ImageCompare
      before={
        <Scaled>
          <Scene theme="light" />
        </Scaled>
      }
      after={
        <Scaled>
          <Scene theme="dark" />
        </Scaled>
      }
      labels={['Light', 'Dark']}
      label="Leta components, light and dark mode"
      aspectRatio={`${W} / ${H}`}
      className="leta-theme-compare"
    />
  );
}
