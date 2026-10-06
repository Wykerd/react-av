import type { APIRoute, GetStaticPaths } from 'astro';
import { docs } from '../../lib/docs';

export const getStaticPaths: GetStaticPaths = () => docs.map(page => ({
	params: { slug: page.slug },
	props: { page },
}));

export const GET: APIRoute = ({ props }) => {
	const { page } = props;
	return new Response(`# ${page.title}\n\n> ${page.description}\n\n${page.content}\n`, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
