---
"@react-av/shaka": patch
---

The player is created with the media element again instead of calling `attach()`, so Shaka's "initializing Player with a mediaElement" deprecation warning returns. The 0.0.6 fix for it was published from changes that never reached the repository, so this release does not include it.
