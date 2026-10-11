---
title: React Video Thumbnail Previews
description: Show storyboard thumbnail previews at a video's playback position using WebVTT metadata and the React AV StoryboardThumbnail component.
layout: ../../layouts/MainLayout.astro
---

The vtt-controls module, `@react-av/vtt-controls`, provides a set of components for interacting with chapter and storyboard VTT files. 

```bash
npm i @react-av/core @react-av/vtt-core @react-av/vtt @react-av/vtt-controls @radix-ui/react-select
```

**This package is still very barebones and is still in active development, like most of the other packages.**

## CaptionTrackSelectRoot and CaptionTrackSelectItems

Compose a caption language picker with [Radix Select](https://www.radix-ui.com/primitives/docs/components/select). `CaptionTrackSelectRoot` connects the selection to the current player's caption tracks. `CaptionTrackSelectItems` lists "Off" and one item per `subtitles` or `captions` track, using its `label`, then its `srclang`, then "Track N". Choosing a language shows only that track; choosing "Off" hides captions, including while paused or before the first playback.

Use Radix's trigger, value, content and viewport to control the layout and styling. Give the trigger an accessible name. Place the portal inside `Media.Container` so the menu remains visible in fullscreen.

```jsx
import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Media from '@react-av/core';
import { Track } from '@react-av/vtt';
import { CaptionTrackSelectRoot, CaptionTrackSelectItems } from '@react-av/vtt-controls';

function Player() {
  const [container, setContainer] = useState(null);

  return (
    <Media.Root>
      <Media.Container ref={setContainer}>
        <Media.Video src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" />
        <CaptionTrackSelectRoot>
          <Select.Trigger aria-label="Captions" className="caption-trigger">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal container={container}>
            <Select.Content position="popper" className="caption-menu">
              <Select.Viewport>
                <CaptionTrackSelectItems className="caption-item" />
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </CaptionTrackSelectRoot>
      </Media.Container>
      <Track src="https://example.com/english.vtt" srclang="en" label="English" default />
      <Track src="https://example.com/french.vtt" srclang="fr" label="Français" />
    </Media.Root>
  );
}
```

`CaptionTrackSelectRootProps` accepts Radix Select root props except `value` and `defaultValue`: the visible caption track owns the value. `disabled`, `open`, `onOpenChange` and other root props work as usual. `onValueChange` runs after the caption changes, with `"off"` or the track's zero-based index as a string. Use `useMediaCaptionTracks` when you need the track object.

`CaptionTrackSelectItemsProps` accepts Radix Select item props except `value` and `children`, and applies them to every generated item. Set `offLabel` to translate "Off". Style highlighted items with `[data-highlighted]` and the selected item with `[data-state="checked"]`. Put refs and trigger event handlers on the Radix primitives; the root does not render an element.

## useMediaCaptionTracks()

Build a custom caption menu without Radix. This hook can also keep other caption controls in sync with the picker.

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
