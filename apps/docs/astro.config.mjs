import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [
  // Enable Preact to support Preact JSX components.
  preact({
    include: ['**/src/components/**/*.tsx'],
  }),
  // Enable React for the interactive demos.
  react({
    include: ['**/src/demos/**/*.tsx'],
  })],
  vite: {
    plugins: [tailwindcss()],
  },
  site: `http://astro.build`
});
