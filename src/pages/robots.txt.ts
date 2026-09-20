import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteURL = site ?? new URL('https://example.com');
  const sitemapURL = new URL('sitemap-index.xml', siteURL);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
