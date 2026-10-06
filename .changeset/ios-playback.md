---
"@react-av/core": patch
"@react-av/controls": patch
"@react-av/shaka": patch
"@react-av/vtt-core": patch
---

Fix iOS playback crashes by caching current-time snapshots, keep Play available before media loads, and default video to inline playback. Support Safari's native fullscreen and picture-in-picture APIs, synchronize native playback controls, handle rejected playback requests, and reveal controls on touch.

Stop media and caption animation loops while paused or hidden, and keep caption layers from intercepting touches. Prefer native HLS and supported media files, load Shaka only when needed, and clean up streaming players correctly when sources change. Expose Shaka failures without uncaught asynchronous errors.
