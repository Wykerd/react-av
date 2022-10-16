const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const external = require('rollup-plugin-peer-deps-external');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: 'src/index.tsx',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
    },
    plugins: [
        typescript(),
        external(),
        resolve(),
    ]
};

module.exports = config;