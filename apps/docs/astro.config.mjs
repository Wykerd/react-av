import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import ink from './src/styles/shiki-ink.mjs';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  integrations: [
  // Enable Preact to support Preact JSX components.
  preact({
    include: ['**/src/components/**/*.tsx'],
  }),
  // Enable React for the interactive demos.
  react({
    include: ['**/src/demos/**/*.tsx'],
  })],
  markdown: {
    shikiConfig: {
      theme: ink,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  site: `https://react-av.wykerd.dev`
});
