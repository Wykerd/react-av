---
"@react-av/vtt-core": patch
---

Text tracks now fire `cuechange` when their active cues change, so apps listening for it, such as a transcript that highlights the current line, follow along with playback.
