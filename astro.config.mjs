// @ts-check
import { defineConfig } from 'astro/config';
import { env } from 'node:process';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = env.PUBLIC_SITE_URL ?? 'https://example.com';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site,

  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: false,
    },
  },
});
