import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import relativeLinks from 'astro-relative-links';

import image from "@astrojs/image";

// https://astro.build/config
import react from "@astrojs/react";

// Serves the weekly image DSL sandbox at /weekly/preview during `astro dev`
// only. The page lives in src/dev/ rather than src/pages/ so that it is not a
// route at all, and is injected here purely for local development — otherwise
// it would build into dist/ and be publicly reachable on the live site.
function weeklyPreviewRoute() {
  return {
    name: 'weekly-preview-route',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({
          pattern: '/weekly/preview',
          entryPoint: './src/dev/weekly-preview.astro',
        });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://weavergoldman.com',
  integrations: [weeklyPreviewRoute(), relativeLinks(), mdx(), sitemap(), tailwind(), image({
    serviceEntryPoint: '@astrojs/image/sharp',
    cacheDir: "./.cache/image",
    logLevel: 'debug'
  }), react()]
});