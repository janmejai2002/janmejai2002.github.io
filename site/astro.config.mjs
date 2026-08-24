import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://janmejai.dev',
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark-dimmed', wrap: true } },
});
