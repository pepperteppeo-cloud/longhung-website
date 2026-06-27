import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://vpplonghung.com',
  integrations: [sitemap()],
  adapter: cloudflare(),
  output: 'server',
  devToolbar: {
    enabled: false,
  },

  prefetch: false,
});