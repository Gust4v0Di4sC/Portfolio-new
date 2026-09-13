// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  // Trocar quando o domínio definitivo for escolhido.
  site: 'https://example.com',

  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: false,
    },
  },
});
