const windyRadix = require('windy-radix-palette');

const colors = windyRadix.createPlugin()

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
	  extend: {
		colors: {
		  prime: colors.alias('indigo'),
		  primeA: colors.alias('indigoA'),
		  pure: 'var(--pure)',
		  border: "var(--border)",
		  input: "var(--input)",
		  ring: "var(--ring)",
		  background: "var(--background)",
		  foreground: "var(--foreground)",
		  primary: {
			DEFAULT: "var(--primary)",
			foreground: "var(--primary-foreground)",
		  },
		  secondary: {
			DEFAULT: "var(--secondary)",
			foreground: "var(--secondary-foreground)",
		  },
		  destructive: {
			DEFAULT: "var(--destructive)",
			foreground: "var(--destructive-foreground)",
		  },
		  muted: {
			DEFAULT: "var(--muted)",
			foreground: "var(--muted-foreground)",
		  },
		  accent: {
			DEFAULT: "var(--accent)",
			foreground: "var(--accent-foreground)",
		  },
		  popover: {
			DEFAULT: "var(--popover)",
			foreground: "var(--popover-foreground)",
		  },
		  card: {
			DEFAULT: "var(--card)",
			foreground: "var(--card-foreground)",
		  },
		},
	  },
	},
	plugins: [colors.plugin],
}
