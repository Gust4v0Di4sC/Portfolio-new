// @ts-check
import { defineConfig } from 'astro/config';
import { env } from 'node:process';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const deploymentSite =
  env.PUBLIC_SITE_URL ??
  env.VERCEL_PROJECT_PRODUCTION_URL ??
  env.URL ??
  env.CF_PAGES_URL ??
  'https://example.com';
const site = /^https?:\/\//i.test(deploymentSite) ? deploymentSite : `https://${deploymentSite}`;

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site,

  integrations: [
    react(),
    sitemap({
      namespaces: {
        news: false,
        video: false,
        xhtml: false,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: false,
    },
  },
});
