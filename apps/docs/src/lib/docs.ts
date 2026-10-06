import type { MarkdownInstance } from 'astro';
import type { Frontmatter } from '../config';

const pages = import.meta.glob<MarkdownInstance<Frontmatter>>('../pages/en/*.md', { eager: true });

export const docs = Object.entries(pages).map(([path, page]) => ({
	slug: path.replace('../pages/en/', '').replace(/\.md$/, ''),
	title: page.frontmatter.title,
	description: page.frontmatter.description,
	content: page.rawContent().replace(/<!--[\s\S]*?-->/g, '').trim(),
}));
