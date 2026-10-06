export const SITE = {
	title: 'React AV',
	description: 'Build custom React audio and video players with headless components, playback hooks, HLS/DASH streaming, WebVTT captions, and subtitle editing.',
	defaultLanguage: 'en_US',
};

export const OPEN_GRAPH = {
	image: {
		src: '/og-image.png',
		alt:
			'Fully-featured, headless, hooks-based, and declarative media player framework for React.',
	},
	twitter: 'danielwykerd',
};

// This is the type of the frontmatter you put in the docs markdown files.
export type Frontmatter = {
	title: string;
	description: string;
	layout: string;
	image?: { src: string; alt: string };
	dir?: 'ltr' | 'rtl';
	ogLocale?: string;
	lang?: string;
};

export const KNOWN_LANGUAGES = {
	English: 'en',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://github.com/Wykerd/react-av/tree/master/apps/docs`;

export const COMMUNITY_INVITE_URL = ``;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
	indexName: 'XXXXXXXXXX',
	appId: 'XXXXXXXXXX',
	apiKey: 'XXXXXXXXXX',
};

export type Sidebar = Record<
	typeof KNOWN_LANGUAGE_CODES[number],
	Record<string, { text: string; link: string }[]>
>;
export const SIDEBAR: Sidebar = {
	en: {
		'Getting Started': [
			{ text: 'Introduction', link: 'en/introduction' },
		],
		'Guides': [
			{ text: 'Subtitle editor', link: 'en/subtitle-editor' },
		],
		'Core': [
			{ text: 'Components', link: 'en/core-components' },
			{ text: 'Hooks', link: 'en/core-hooks' },
			{ text: 'HLS and DASH support', link: 'en/core-other-sources' },
		],
		'Text Tracks': [
			{ text: 'Introduction', link: 'en/text-track-introduction' },
			{ text: 'Components', link: 'en/text-track-components' },
			{ text: 'Hooks', link: 'en/text-track-hooks' },
			{ text: 'Implementation', link: 'en/webvtt' }
		],
		'Controls': [
			{ text: 'Introduction', link: 'en/controls-intro' },
			{ text: 'Core Controls', link: 'en/controls' },
			{ text: 'Sliders', link: 'en/sliders' },
			{ text: 'VTT Controls', link: 'en/vtt-controls' },
		],
	},
};
