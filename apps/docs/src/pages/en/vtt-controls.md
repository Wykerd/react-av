---
title: VTT Controls
description: React Components for interacting with chapter and storyboard VTT files.
layout: ../../layouts/MainLayout.astro
---

The vtt-controls module, `@react-av/vtt-controls`, provides a set of components for interacting with chapter and storyboard VTT files. 

```bash
npm i @react-av/core @react-av/vtt-core @react-av/vtt @react-av/vtt-controls
```

**This package is still very barebones and is still in active development, like most of the other packages.**

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
