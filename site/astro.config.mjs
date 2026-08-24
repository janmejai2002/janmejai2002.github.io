import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages user site → served at the root of janmejai2002.github.io.
// If you move this to a PROJECT repo instead (e.g. github.com/janmejai2002/wabi-sabi),
// add `base: '/wabi-sabi/'` below and keep `site` as the github.io origin.
// For a custom domain later: set `site` to it and drop a CNAME file in site/public/.
export default defineConfig({
  site: 'https://janmejai2002.github.io',
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark-dimmed', wrap: true } },
});
