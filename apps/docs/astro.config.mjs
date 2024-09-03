import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import react from '@astrojs/react';

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
  // Enable Preact to support Preact JSX components.
  preact({
    include: ['src/components/**/*.tsx'],
  }),
  // Enable React for the Algolia search component.
  react({
    include: ['src/demos/**/*.tsx'],
  }), tailwind()],
  site: `http://astro.build`
});