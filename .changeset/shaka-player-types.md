---
"@react-av/shaka": minor
---

`@react-av/shaka` now uses Shaka Player's own types: `useMediaShaka()` and the component ref's `player` are `shaka.Player | null`, `onPlayerReady` receives a `shaka.Player`, and `shakaConfig` is checked against Shaka Player's configuration as the new `ShakaConfig` type. No extra type package is needed.
