---
"@react-av/core": patch
"@react-av/controls": patch
"@react-av/sliders": patch
"@react-av/vtt": patch
"@react-av/vtt-core": patch
"@react-av/vtt-controls": patch
"@react-av/shaka": patch
"@react-av/editor": patch
---

Security hardening: `toVTT` no longer lets cue text inject extra cues, `StoryboardThumbnail` validates storyboard URLs and regions instead of crashing, WebVTT cue text now decodes HTML character references, and published packages only include build output and sources.
