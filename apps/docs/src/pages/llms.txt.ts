import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { docs } from '../lib/docs';

export const GET: APIRoute = ({ site }) => {
	const links = docs.map(page =>
		`- [${page.title}](${new URL(`/en/${page.slug}.md`, site)}): ${page.description}`,
	);
	const content = [
		`# ${SITE.title}`,
		`> ${SITE.description}`,
		'React AV is a headless library for browser-based React applications. Components are unstyled; applications supply their own layout and CSS. Render interactive media components in the browser. HLS and DASH use the optional @react-av/shaka package and Shaka Player.',
		`Start with [the getting started guide](${new URL('/en/introduction.md', site)}). Each documentation page has a Markdown version with the same examples and API reference.`,
		'## Documentation',
		links.join('\n'),
		'## Optional',
		'- [Source and issues](https://github.com/Wykerd/react-av): Package source code, releases, and issue tracking.',
	];
	return new Response(`${content.join('\n\n')}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
