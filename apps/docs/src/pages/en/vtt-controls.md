---
title: React Video Thumbnail Previews
description: Show storyboard thumbnail previews at a video's playback position using WebVTT metadata and the React AV StoryboardThumbnail component.
layout: ../../layouts/MainLayout.astro
---

The vtt-controls module, `@react-av/vtt-controls`, provides a set of components for interacting with chapter and storyboard VTT files. 

```bash
npm i @react-av/core @react-av/vtt-core @react-av/vtt @react-av/vtt-controls
```

**This package is still very barebones and is still in active development, like most of the other packages.**

## CaptionTrackSelect

A native `select` for choosing which subtitle or caption track is shown. It lists an "Off" option followed by one option per `subtitles` or `captions` track, named by the track's `label` or, without a label, its `srclang`. Choosing a track shows only that track; choosing "Off" hides all of them.

It is a `HTMLSelectElement` and accepts all the props that a `select` element accepts except for `value`, `defaultValue`, `multiple` and `children`. Its accessible name defaults to "Captions"; pass `aria-label` to change it. The `offLabel` prop sets the text of the "Off" option.

```jsx
import * as Media from '@react-av/core';
import { Track } from '@react-av/vtt';
import { CaptionTrackSelect } from '@react-av/vtt-controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" />
    </Media.Container>
    <Track src="https://example.com/english.vtt" srclang="en" label="English" default />
    <Track src="https://example.com/french.vtt" srclang="fr" label="Français" />
    <CaptionTrackSelect />
  </Media.Root>
)
```

## useMediaCaptionTracks()

The hook behind `CaptionTrackSelect`, for building your own caption menu.

**Returns:** `{ tracks, selected, select }` where `tracks` is the list of subtitle and caption `TextTrack`s, `selected` is the track that is showing or `null`, and `select(track)` shows only the given track, or hides all of them when passed `null`.

## StoryboardThumbnail

Displays a storyboard thumbnail for the media provided a timestamp and the id of the storyboard VTT file.

It is a `HTMLImageElement` and accepts all the props that an `HTMLImageElement` accepts except for `src`. Additionally, it has a `timestamp` prop that is the time in seconds of the thumbnail and a `storyboardId` prop of the text track to be used.

```jsx
import * as Media from '@react-av/core';
import { Track } from '@react-av/vtt';
import { StoryboardThumbnail } from '@react-av/vtt-controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" />
    </Media.Container>
    <Track
      src="https://example.com/storyboard.vtt"
      kind="metadata"
      label="Storyboard"
      id="storyboard"
    />
    <StoryboardThumbnail
      timestamp={10}
      storyboardId="storyboard"
    />
  </Media.Root>
)
```
