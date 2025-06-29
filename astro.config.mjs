import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import relativeLinks from 'astro-relative-links';

// https://astro.build/config
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: 'https://weavergoldman.com',
  integrations: [relativeLinks(), mdx(), sitemap(), tailwind(), image(
    {
      serviceEntryPoint: '@astrojs/image/sharp',
      cacheDir: "./.cache/image",
      logLevel: 'debug',
    }
  )]
});