---
title: React Video Thumbnail Previews
description: Show storyboard thumbnail previews at a video's playback position using WebVTT metadata and the React AV StoryboardThumbnail component.
layout: ../../layouts/MainLayout.astro
---

The vtt-controls module, `@react-av/vtt-controls`, provides a set of components for interacting with caption, chapter and storyboard VTT files.

```bash
npm i @react-av/core @react-av/vtt-core @react-av/vtt @react-av/vtt-controls
```

**This package is still very barebones and is still in active development, like most of the other packages.**

## CaptionsToggle

A button that turns captions on and off for the `captions` and `subtitles` tracks added with `Track`.

Turning captions off hides every showing captions or subtitles track. Turning them on shows the track that was showing last, or the first captions or subtitles track if none was. Add `default` to a `Track` to show it from the start.

The button sets `aria-pressed` while captions are showing and is disabled while the media has no captions or subtitles tracks.

It is a `HTMLButtonElement` and accepts all props that a `button` element accepts.

Additionally, it accepts the following props for icon:

- `icon` - The icon to use. Defaults to the `ClosedCaptioning` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `defaultIconSize` - Size of the default icon if you are using the default icon from the [Phosphor Icons](https://phosphoricons.com/) library. Defaults to `32`.

Styling may be done via the props:

- `activeClassName` - The class name to apply while captions are showing.

Alternatively, use the CSS selectors to style the component:

- `button[data-media-captions-state="on"]` - Captions are showing.
- `button[data-media-captions-state="off"]` - Captions are hidden.

```jsx
import * as Media from '@react-av/core';
import { Track } from '@react-av/vtt';
import { CaptionsToggle } from '@react-av/vtt-controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Track
      src="https://example.com/captions.vtt"
      kind="captions"
      srclang="en"
      label="English"
      default
    />
    <Media.Viewport>
      <CaptionsToggle />
    </Media.Viewport>
  </Media.Root>
)
```

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
