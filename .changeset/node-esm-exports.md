---
"@react-av/controls": patch
"@react-av/core": patch
"@react-av/editor": patch
"@react-av/shaka": patch
"@react-av/sliders": patch
"@react-av/vtt": patch
"@react-av/vtt-controls": patch
"@react-av/vtt-core": patch
---

Native Node imports and require calls share the CommonJS build and matching declarations through a native ES module wrapper. Browser bundlers retain the ES module entry, with explicit relative extensions and an ES module scope. Only the package entry point and `package.json` can be imported; deep imports into `dist` are no longer supported.
