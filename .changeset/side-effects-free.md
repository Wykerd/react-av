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

Let bundlers drop unused React AV code. Importing a single component, such as `PlayPause`, no longer bundles every other component in the package; captions keep working.
