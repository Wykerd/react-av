---
title: Introduction
description: Introduction to the React AV library
layout: ../../layouts/MainLayout.astro
---

**Build modern media players with React.**

A modern library for building media experiences in React, including features such as:

- ✅ **Bring your own media source. Supports HLS, DASH, and more.**
- ✅ **Consistent and simple hooks-based API. Interact with your media in custom components.**
- ✅ **Cross browser support for picture-in-picture and fullscreen.**
- ✅ **Headless, style however you want.**
- ✅ **Extensive set of prebuilt components.**
- ✅ **Fully typed, built with TypeScript.**
- ✅ **Caption, chapter and storyboard support with a fully-featured<!-- TODO: spec compliant --> WebVTT implementation.**

## Getting Started

To get started, install the core module:

```bash
npm i @react-av/core
```

Media must be wrapped in a `Media.Root` component. This component is responsible for managing the media state and providing it to all child components. The core library provides basic components for HTML5 audio and video, but we do provide HLS and DASH support via the `@react-av/hls` and `@react-av/dash` packages.

Video components must be wrapped in a `Media.Container` to allow for overlays and captions to be positioned correctly.

```jsx
import * as Media from '@react-av/core';

function App() {
  return (
    <Media.Root>
        <Media.Container>
            <Media.Video src="https://example.com/video.mp4" />
        </Media.Container>
    </Media.Root>
  );
}
```

You may now interact with the media via your own custom components. For example, you may want to create a custom play/pause button:

```jsx
import * as Media from '@react-av/core';

function PlayPauseButton() {
    const [playing, setPlaying] = Media.useMediaPlaying();

    return (
        <button onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
        </button>
    );
}

function App() {
  return (
    <Media.Root>
        <Media.Container>
            <Media.Video src="https://example.com/video.mp4" />
        </Media.Container>
      <PlayPauseButton />
    </Media.Root>
  );
}
```

Instead of writing a bunch of components for common media interactions, we provide a set of prebuilt components that you can use via the `@react-av/controls` package.

```bash
npm i @react-av/controls
```

```jsx
import * as Media from '@react-av/core';
import { 
    Fullscreen, Mute, PictureInPicture, PlayPause, Timestamp 
} from '@react-av/controls';

function App() {
  return (
    <Media.Root>
        <Media.Container>
            <Media.Video src="https://example.com/video.mp4" />
        </Media.Container>
      <Fullscreen />
      <Mute />
      <PictureInPicture />
      <PlayPause />
      <Timestamp />
    </Media.Root>
  );
}
```

These controls are currently rendered below the video element, if you want to render them above the video element, you can use the `Media.Viewport` component.

```jsx
import * as Media from '@react-av/core';
import { 
    Fullscreen, Mute, PictureInPicture, PlayPause, Timestamp 
} from '@react-av/controls';

function App() {
  return (
    <Media.Root>
        <Media.Container>
            <Media.Video src="https://example.com/video.mp4" />
        </Media.Container>
        <Media.Viewport>
            <Fullscreen />
            <Mute />
            <PictureInPicture />
            <PlayPause />
            <Timestamp />
        </Media.Viewport>
    </Media.Root>
  );
}
```

Since React AV is headless, all of the components are unstyled. You can style them however you want, we do not provide any default styles. You may look at our demo site for an example of how we style the controls, [here](https://github.com/Wykerd/react-av/blob/master/apps/docs/src/components/VideoExample.tsx)

## Packages

React AV is split into multiple modules to allow you to pick which features you need. All modules are available on npm:
- `@react-av/core` - Core library for building your own media player in React.
- `@react-av/controls` - Prebuilt media player components.
- `@react-av/sliders` - Prebuilt sliders for volume and seek.
- `@react-av/vtt-core` - Implementation of the WebVTT spec for parsing and rendering captions.
- `@react-av/vtt` - Adds WebVTT support to `@react-av/core`.
- `@react-av/vtt-controls` - Additional controls for WebVTT captions, chapters and storyboards.

Also provided are some providers for common media sources:
- `@react-av/hls` - Adds HLS support to `@react-av/core` using `hls.js`.
- `@react-av/dash` - Adds DASH support to `@react-av/core` using `dash.js`.


