import fs from 'node:fs';
import path from 'node:path';

function readExports(filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const names = new Set();
    for (const match of source.matchAll(/exports\.([\w$]+)\s*=|Object\.defineProperty\(exports, "([\w$]+)"/g)) {
        const name = match[1] ?? match[2];
        if (name !== '__esModule') {
            names.add(name);
        }
    }
    for (const match of source.matchAll(/__exportStar\(require\("(\.\/[^"]+)"\), exports\)/g)) {
        const reexports = readExports(path.resolve(path.dirname(filename), match[1]));
        for (const name of reexports) {
            if (name !== 'default') {
                names.add(name);
            }
        }
    }
    return names;
}

const names = readExports(path.resolve('dist/cjs/index.js'));
const statements = [...names].map((name) => {
    if (name === 'default') {
        return 'export default commonjs.default;';
    }
    return `export const ${name} = commonjs.${name};`;
});
const declarations = ['export * from "../cjs/index.js";'];
if (names.has('default')) {
    declarations.push('export { default } from "../cjs/index.js";');
}
fs.writeFileSync('dist/esm/node.js', ['import commonjs from "../cjs/index.js";', ...statements, ''].join('\n'));
fs.writeFileSync('dist/esm/node.d.ts', [...declarations, ''].join('\n'));
