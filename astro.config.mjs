// @ts-check
import { defineConfig } from 'astro/config';
import { env } from 'node:process';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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
  i18n: {
    locales: ['pt-BR', 'en'],
    defaultLocale: 'pt-BR',
    routing: {
      prefixDefaultLocale: false,
    },
  },

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
    build: {
      sourcemap: false,
    },
  },
});
