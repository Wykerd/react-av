const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const external = require('rollup-plugin-peer-deps-external');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: true
        },
        {
            file: 'dist/index.es.js',
            format: 'es',
            sourcemap: true
        }
    ],
    plugins: [
        typescript(),
        external(),
        resolve(),
    ],
    external: [
        '@react-aria/interactions',
        '@react-aria/utils',
    ]
};

module.exports = config;