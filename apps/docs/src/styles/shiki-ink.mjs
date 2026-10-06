export default {
	name: 'ink',
	type: 'light',
	colors: {
		'editor.background': '#f3f1ea',
		'editor.foreground': '#17160f',
	},
	tokenColors: [
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: '#8f8a7e', fontStyle: 'italic' },
		},
		{
			scope: ['string', 'string.quoted', 'punctuation.definition.string', 'constant.numeric', 'constant.language'],
			settings: { foreground: '#c23d00' },
		},
		{
			scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'],
			settings: { foreground: '#17160f', fontStyle: 'bold' },
		},
		{
			scope: ['entity.name.tag', 'support.class.component', 'entity.name.function', 'support.function', 'entity.name.type'],
			settings: { foreground: '#17160f' },
		},
		{
			scope: ['entity.other.attribute-name', 'variable.parameter', 'meta.object-literal.key'],
			settings: { foreground: '#66625a' },
		},
		{
			scope: ['punctuation', 'meta.brace', 'meta.tag.punctuation', 'punctuation.definition.tag', 'keyword.operator'],
			settings: { foreground: '#8f8a7e' },
		},
	],
};
