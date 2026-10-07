---
title: React Audio and Video Components
description: Compose React media players with Media.Root, Video, Audio, Container, and Viewport. Learn how state, media elements, and overlays fit together.
layout: ../../layouts/MainLayout.astro
---

The core library `@react-av/core` provides several components for building media applications. 

## General Structure

All React AV components must be wrapped in a `Media.Root` component. This component provides the context for all other components to work. 

Other components may be nested inside the `Media.Root` component to build your own media player.

For video players, you may use our `Video` component. This component is a wrapper around the HTML5 `<video>` element. You are required to wrap this video element in a `Media.Container` component. This component allows for overlays (using the `Media.Viewport`) and captions to be rendered correctly on top of the video element.

Generally, a video player will be structured like this:

```jsx
import * as Media from '@react-av/core';

function MyVideoPlayer() {
  return (
    <Media.Root>
      <Media.Container>
        <Media.Video src="https://example.com/video.mp4" />
      </Media.Container>
      <Media.Viewport>
        { /* Your UI components */ }
      </Media.Viewport>
    </Media.Root>
  );
}
```

## Media.Root

The `Media.Root` component is the root of the React AV component tree. It provides the context for all other components to work. Internally, we use [Recoil](https://recoiljs.org/) to manage the player state.

Each media player must be wrapped in its own `Media.Root` component. This allows for multiple players to be rendered on the same page.

### Deferred loading

Set `loading="lazy"` on `Media.Root` to render the complete player while deferring
native media loading. Wrap the media and its visible controls in `Media.Container`,
including for audio players. Loading activates once the container comes within
200 pixels of the viewport, receives focus or a pointer press, or playback starts.
Leaving the viewport does not pause the player or reset its playback state.

```jsx
<Media.Root loading="lazy">
  <Media.Container>
    <Media.Video src="/video.mp4" poster="/poster.jpg" preload="auto" />
    <PlayPause />
  </Media.Container>
</Media.Root>
```

Before activation, `Media.Video` and `Media.Audio` use `preload="none"` and defer
`autoPlay`. After activation, they honor your original props. Preloading remains
a browser hint; explicit playback can load the source immediately. Browsers
without `IntersectionObserver` activate on mount. The default `loading="eager"`
preserves normal browser loading behavior.

`useMediaLoadingState()` and the container's `data-media-loading` attribute expose
`deferred`, `loading`, `ready`, or `error`. `ready` means a current frame or audio
data is available; later buffering can return to `loading`. This option controls
native media loading, while your framework controls JavaScript delivery and
hydration. Streaming adapters manage their own network requests.
Server rendering keeps the player shell and poster present before
hydration; supply dimensions to reserve the video's space.

```jsx
import * as Media from '@react-av/core';

() => (
  <Media.Root>
    { /* Your media player */ }
  </Media.Root>
);
```

## Media.Container

The `Media.Container` component is a wrapper around the video element. It is required by other parts of the React AV library to correctly render overlays and captions. It acts as a portal for both captions and the `Media.Viewport` component.

It is a `HTMLDivElement` and accepts all props that a `div` element accepts.

```jsx
import * as Media from '@react-av/core';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video />
    </Media.Container>
  </Media.Root>
);
```

## Media.Viewport

The `Media.Viewport` component allows you to overlay UI components on top of the video element. It portals the UI components to the `Media.Container` component.

It is a `HTMLDivElement` and accepts all props that a `div` element accepts.

Additionally has a `hoverInactiveTimeout` prop that allows you to set a timeout for the hover state to be inactive. This is useful for hiding UI components when the user is not interacting with the player. The default value is `2000` milliseconds.

For styling the inactive state of the viewport, you can use the `inactiveClassName` prop. This prop accepts a string of class names that will be applied to the viewport when the hover state is inactive. Or if you prefer to use CSS selectors, you can use `div[data-media-viewport-hover="false"]`.

```jsx
import * as Media from '@react-av/core';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video />
    </Media.Container>
    <Media.Viewport>
      { /* Your UI components */ }
    </Media.Viewport>
  </Media.Root>
);
```

## Media.Video

The `Media.Video` component is a wrapper around the HTML5 `<video>` element. It accepts all props that a `video` element accepts.

```jsx
import * as Media from '@react-av/core';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
  </Media.Root>
);
```

## Media.Audio

Unlike the `Media.Video` component, the `Media.Audio` component does not require a `Media.Container` component since it is not rendered to the screen.

The `Media.Audio` component is a wrapper around the HTML5 `<audio>` element. It accepts all props that an `audio` element accepts.

```jsx
import * as Media from '@react-av/core';

() => (
  <Media.Root>
    <Media.Audio src="https://example.com/audio.mp3" />
  </Media.Root>
);
```
