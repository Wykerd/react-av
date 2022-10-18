---
title: Text Track Hooks
description: React Hooks API for working with text tracks in React AV.
layout: ../../layouts/MainLayout.astro
---

The vtt module, `@react-av/vtt`, provides a single hook for consuming text tracks in React AV. More hooks are to come to provide additional functionality.

## useMediaTextTrack(id)

Access the cues of a text track, given its ID. It returns a tuple of all the cues and the active cues (cues that are currently being displayed). These values are reactive and will update when the cues change.

**Parameters:** `id: string`

**Returns:** `[VTTCue[], VTTCue[]]` where the first element is all the cues and the second element is the active cues.
