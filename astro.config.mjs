// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

// Static output deploys to Vercel or Netlify without an adapter.
export default defineConfig({
  site: 'https://generalstan.github.io',
  base: '/ify-not-iffy',
  output: 'static',
  integrations: [mdx(), react()],
  // The Leta components (step 1.0 light/dark compare) import CSS and fonts from their packages,
  // so the server render bundles them instead of loading them from node_modules.
  vite: {
    resolve: { noExternal: ['@leta-io/components', '@leta-io/design-tokens', '@leta-io/icons'] },
    ssr: { noExternal: ['@leta-io/components', '@leta-io/design-tokens', '@leta-io/icons'] },
  },
  server: {
    host: true,
    port: 4477,
  },
});
