---
"@react-av/core": patch
---

`useMediaDuration` returns `0` instead of `NaN` until the media's duration is known, so timestamps no longer render `NaN:NaN` while loading.
