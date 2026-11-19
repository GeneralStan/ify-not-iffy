// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Static output deploys to Vercel or Netlify without an adapter.
export default defineConfig({
  site: 'https://generalstan.github.io',
  base: '/ify-not-iffy',
  output: 'static',
  integrations: [mdx()],
  server: {
    host: true,
    port: 4477,
  },
});
