const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const external = require('rollup-plugin-peer-deps-external');
const commonjs = require('@rollup/plugin-commonjs');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: 'src/index.tsx',
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
        commonjs(),
        typescript(),
        external(),
        resolve(),
    ],
    external: [
        'hls.js'
    ],
};

module.exports = config;