import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'tokens', 'tokens.json');
const outPath = path.join(root, 'src', 'styles', 'tokens.css');

const tokens = JSON.parse(await readFile(sourcePath, 'utf8'));

const lines = [];

function emit(line = '') {
  lines.push(line);
}

function block(selector, declarations, indent = '') {
  emit(`${indent}${selector} {`);
  for (const [name, value] of declarations) {
    emit(`${indent}  ${name}: ${value};`);
  }
  emit(`${indent}}`);
}

function percentToEm(percent) {
  if (typeof percent !== 'number' || Number.isNaN(percent)) {
    throw new Error(`Tracking must be a percentage number, received ${percent}`);
  }
  const em = percent / 100;
  if (em === 0) return '0em';
  const raw = em.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  return `${raw}em`;
}

function pxNumber(value) {
  const match = String(value).match(/^(-?[\d.]+)px$/);
  if (!match) throw new Error(`Expected a px length, received ${value}`);
  return Number(match[1]);
}

const { primitive, semantic, typography } = tokens;
const colorVars = new Map();

for (const [ramp, steps] of Object.entries(primitive.color.ramps)) {
  for (const [step, value] of Object.entries(steps)) {
    colorVars.set(`--color-${ramp}-${step}`, value);
  }
}

for (const [name, value] of Object.entries(primitive.color.alpha)) {
  colorVars.set(`--color-${name}`, value);
}

for (const ref of Object.values(semantic.color)) {
  const variable = `--color-${ref}`;
  if (!colorVars.has(variable)) {
    throw new Error(`Semantic color references missing primitive ${variable}`);
  }
}

const requiredAlpha = ['shadow-10', 'shadow-25', 'highlight-10', 'lime-300-60'];
for (const name of requiredAlpha) {
  if (!primitive.color.alpha[name]) {
    throw new Error(`Missing alpha color ${name}`);
  }
}

emit('/* Generated from tokens/tokens.json by scripts/generate-tokens.mjs.');
emit('   Do not edit by hand. Regenerate with `npm run tokens`.');
emit('   Letter-spacing in Figma is stored in px. Tracking in the JSON is a');
emit('   percentage of font size and is emitted here as em. */');
emit('');

const rootDecls = [];

rootDecls.push(['/* Color primitives */', null]);
for (const [name, value] of colorVars) {
  rootDecls.push([name, value]);
}

rootDecls.push(['/* Radius, stroke */', null]);
for (const [name, value] of Object.entries(primitive.radius)) {
  rootDecls.push([`--radius-${name}`, value]);
}
for (const [name, value] of Object.entries(primitive.stroke)) {
  rootDecls.push([`--stroke-${name}`, value]);
}

rootDecls.push(['/* Fonts and weights */', null]);
for (const [name, value] of Object.entries(primitive.font)) {
  rootDecls.push([`--font-${name}`, value]);
}
for (const [name, value] of Object.entries(primitive.fontWeight)) {
  rootDecls.push([`--font-weight-${name}`, value]);
}

rootDecls.push(['/* Breakpoints */', null]);
for (const [name, value] of Object.entries(primitive.breakpoint)) {
  rootDecls.push([`--breakpoint-${name}`, value]);
}

rootDecls.push(['/* Motion */', null]);
for (const [name, value] of Object.entries(primitive.motion.duration)) {
  rootDecls.push([`--motion-duration-${name}`, value]);
}
for (const [name, value] of Object.entries(primitive.motion.easing)) {
  rootDecls.push([`--motion-ease-${name}`, value]);
  rootDecls.push([`--motion-easing-${name}`, value]);
}

rootDecls.push(['/* Semantic color. Edit the refs in tokens.json to retune the theme. */', null]);
for (const [name, ref] of Object.entries(semantic.color)) {
  rootDecls.push([`--color-${name}`, `var(--color-${ref})`]);
}

rootDecls.push(['/* Grid, per breakpoint and the active (desktop) set. */', null]);
for (const [bp, spec] of Object.entries(primitive.grid)) {
  rootDecls.push([`--grid-columns-${bp}`, spec.columns]);
  rootDecls.push([`--grid-gutter-${bp}`, spec.gutter]);
  rootDecls.push([`--grid-margin-${bp}`, spec.margin]);
}
rootDecls.push(['--grid-columns', 'var(--grid-columns-desktop)']);
rootDecls.push(['--grid-gutter', 'var(--grid-gutter-desktop)']);
rootDecls.push(['--grid-margin', 'var(--grid-margin-desktop)']);

rootDecls.push(['/* Type roles. Sizes fluidly scale from 390 to 1440. Line-height is a unitless ratio when the role has lineHeightRatio, so leading stays proportional. */', null]);

function fluidLength(mobileValue, desktopValue) {
  const mobile = pxNumber(mobileValue);
  const desktop = pxNumber(desktopValue);
  if (mobile === desktop) return `${mobile}px`;
  const slope = (desktop - mobile) / (1440 - 390);
  const slopeText = Number(slope.toFixed(5)).toString();
  return `clamp(${mobile}px, calc(${mobile}px + (100vw - 390px) * ${slopeText}), ${desktop}px)`;
}

function typeDecls() {
  const decls = [];
  for (const [role, spec] of Object.entries(typography.roles)) {
    if (spec.mobile.tracking !== spec.desktop.tracking) {
      throw new Error(`${role} tracking must be the same percentage at both breakpoints`);
    }
    decls.push([`--type-${role}-family`, `var(--font-${spec.family})`]);
    decls.push([`--type-${role}-weight`, `var(--font-weight-${spec.weight})`]);
    decls.push([`--type-${role}-size`, fluidLength(spec.mobile.size, spec.desktop.size)]);
    if (typeof spec.lineHeightRatio === 'number') {
      decls.push([`--type-${role}-line-height`, String(spec.lineHeightRatio)]);
    } else {
      decls.push([
        `--type-${role}-line-height`,
        fluidLength(spec.mobile.lineHeight, spec.desktop.lineHeight),
      ]);
    }
    decls.push([`--type-${role}-tracking`, percentToEm(spec.desktop.tracking)]);
  }
  return decls;
}

function buttonDecls(mode) {
  const spec = primitive.button[mode];
  return [
    ['--button-height', spec.height],
    ['--button-font-size', spec.fontSize],
    ['--button-line-height', spec.lineHeight],
    ['--button-padding-y', spec.paddingY],
    ['--button-padding-x', spec.paddingX],
    ['--button-padding-icon', spec.paddingIcon],
    ['--button-padding-end', spec.paddingEnd],
    ['--button-gap', spec.gap],
    ['--button-icon', spec.icon],
    ['--button-tracking', spec.tracking],
  ];
}

rootDecls.push(...typeDecls());
rootDecls.push(['/* Buttons, desktop. The 390px size is overridden below. */', null]);
rootDecls.push(...buttonDecls('desktop'));
rootDecls.push([
  '--type-nav-active-weight',
  `var(--font-weight-${typography.navActiveWeight})`,
]);

emit(':root {');
for (const [name, value] of rootDecls) {
  if (value == null) {
    emit('');
    emit(`  ${name}`);
    continue;
  }
  emit(`  ${name}: ${value};`);
}
emit('}');
emit('');

if (String(primitive.motion.easing.spring).includes('linear(')) {
  emit('/* linear() spring fallback for older engines. */');
  emit('@supports not (transition-timing-function: linear(0, 1)) {');
  block(
    ':root',
    [
      ['--motion-ease-spring', 'cubic-bezier(0.16, 1, 0.3, 1)'],
      ['--motion-easing-spring', 'cubic-bezier(0.16, 1, 0.3, 1)'],
    ],
    '  ',
  );
  emit('}');
  emit('');
}

const desktopPx = pxNumber(primitive.breakpoint.desktop);
const tabletPx = pxNumber(primitive.breakpoint.tablet);

emit(`/* Tablet grid. The desktop frame is ${desktopPx}px wide, so this starts just below it.`);
emit('   Type stays on the desktop values until the tablet breakpoint. */');
emit(`@media (max-width: ${desktopPx - 1}px) {`);
block(
  ':root',
  [
    ['--grid-columns', 'var(--grid-columns-tablet)'],
    ['--grid-gutter', 'var(--grid-gutter-tablet)'],
    ['--grid-margin', 'var(--grid-margin-tablet)'],
  ],
  '  ',
);
emit('}');
emit('');

emit(`/* Mobile grid, below the ${tabletPx}px tablet breakpoint. Type stays fluid. */`);
emit(`@media (max-width: ${tabletPx - 1}px) {`);
block(
  ':root',
  [
    ['--grid-columns', 'var(--grid-columns-mobile)'],
    ['--grid-gutter', 'var(--grid-gutter-mobile)'],
    ['--grid-margin', 'var(--grid-margin-mobile)'],
  ],
  '  ',
);
emit('}');
emit('');

emit('/* Compact buttons from the mobile frame down through 360px. */');
emit('@media (max-width: 390px) {');
block(':root', buttonDecls('mobile'), '  ');
emit('}');
emit('');

emit('/* Type utilities. Weight and family stay on the role; size, leading, and tracking follow the breakpoint. */');
for (const role of Object.keys(typography.roles)) {
  block(`.text-${role}`, [
    ['font-family', `var(--type-${role}-family)`],
    ['font-size', `var(--type-${role}-size)`],
    ['font-weight', `var(--type-${role}-weight)`],
    ['font-style', 'normal'],
    ['line-height', `var(--type-${role}-line-height)`],
    ['letter-spacing', `var(--type-${role}-tracking)`],
  ]);
  emit('');
}

block('.nav-active', [['font-weight', 'var(--type-nav-active-weight)']]);
emit('');

block('.container', [
  ['width', '100%'],
  ['max-width', 'var(--breakpoint-desktop)'],
  ['margin-inline', 'auto'],
  ['padding-inline', 'var(--grid-margin)'],
]);
emit('');

block('.grid', [
  ['display', 'grid'],
  ['grid-template-columns', 'repeat(var(--grid-columns), minmax(0, 1fr))'],
  ['column-gap', 'var(--grid-gutter)'],
  ['row-gap', 'var(--grid-gutter)'],
]);
emit('');

const css = `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;

if (css.includes('letter-spacing: -') && !css.includes('em')) {
  throw new Error('Expected tracking to be emitted in em');
}
if (!css.includes('--color-lime-300-60: rgba(191,229,77,0.60);')) {
  throw new Error('lime-300-60 was not emitted with the expected value');
}
if (!css.includes('--color-shadow-10:') || !css.includes('--color-shadow-25:') || !css.includes('--color-highlight-10:')) {
  throw new Error('Existing alpha colors are missing from the CSS');
}

await writeFile(outPath, css);
console.log(`Wrote ${path.relative(root, outPath)} (${colorVars.size} colors, ${Object.keys(typography.roles).length} type roles)`);
