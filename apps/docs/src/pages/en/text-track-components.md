---
title: Text Track Components
description: React Components for working with text tracks in React AV.
layout: ../../layouts/MainLayout.astro
---

The vtt module, `@react-av/vtt`, provides several components for incorporating text tracks into your media player.

## Cue

The `Cue` component allows you to render a `VTTCue` object as a React component. This calls the `VTTCue.getCueAsHTML()` method to render the cue as HTML.

You must choose which wrapper element to place around the `Cue` component. This is because the `VTTCue.getCueAsHTML()` method returns a `DocumentFragment` which can only have one root element. The `Cue` component will throw an error if you try to render it without a wrapper element. This is done via the `as` prop. All other props are passed to this wrapper element.

```jsx
import { Cue } from '@react-av/vtt';

() => (
  <Cue
    as="span"
    cue={new VTTCue(0, 10, 'Hello World')}
  />
);
```

## Track

The `Track` component allows you to add tracks to your media player. You should use this component instead of the built-in `track` element.

<!-- TODO: once the Track component is cleaned up, this should be updated -->

Our `Track` component is still a work in progress. As such we do not yet provide a complete list of props required to use this component. We are working on this and will update this documentation once it is complete.

```jsx
import * as Media from '@react-av/core';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video />
    </Media.Container>
    <Track kind="subtitles" language="en" src="subtitles.vtt" />
  </Media.Root>
);
```

## InterfaceOverlay

When using the `Media.Viewport` component, you may want to render a custom overlay on top of the video element. This overlay may contain buttons or other UI elements that you want to be rendered on top of the video element. However, when using captions, these UI elements may be rendered on top of the captions. To prevent this, wrap the UI elements in the `InterfaceOverlay` component, which will be used by our WebVTT renderer to prevent collisions with captions.

Since the viewport allows for hover states, we provide a `inactiveClassName` to style this inactive state. You may also use the CSS selector `div[data-media-overlay-inactive="true"]` to style this state.

If you wish to force an active state for the overlay, you can use the `persistent` prop.

```jsx
import * as Media from '@react-av/core';
import { InterfaceOverlay } from '@react-av/vtt';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video />
    </Media.Container>
    <Media.Viewport>
      <InterfaceOverlay>
        { /* Your UI elements */ }
      </InterfaceOverlay>
    </Media.Viewport>
  </Media.Root>
);
```