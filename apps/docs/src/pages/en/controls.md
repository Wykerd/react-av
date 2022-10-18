---
title: Core Controls
description: React Components for building basic media players.
layout: ../../layouts/MainLayout.astro
---

The controls package `@react-av/controls` provides several components for building basic media players so you don't have to write them yourself.

Like the core library, all components are unstyled and are meant to be used with your own custom styles. This allows you to build a media player that matches your brand.

## Controls.PlayPause

The `Controls.PlayPause` component is a button that toggles the media player between playing and paused states.

It is a `HTMLButtonElement` and accepts all props that a `button` element accepts.

Additionally, it accepts the following props for icons:

- `playIcon` - The icon to use when the media player is paused. Defaults to the `Play` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `pauseIcon` - The icon to use when the media player is playing. Defaults to the `Pause` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `loadingIcon` - The icon to use when the media player is loading. Defaults to the `Spinner` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `defaultIconSize` - Size of the default icons if you are using the default icons from the [Phosphor Icons](https://phosphoricons.com/) library. Defaults to `32`.

Styling may be done via the props:

- `playingClassName` - The class name to apply when the media player is playing.
- `pausedClassName` - The class name to apply when the media player is paused.
- `loadingClassName` - The class name to apply when the media player is loading.

Alternatively, use the CSS selectors to style the component:

- `button[data-media-play-state="playing"]` - The component is playing.
- `button[data-media-play-state="paused"]` - The component is paused.
- `button[data-media-play-state="loading"]` - The component is loading.

```jsx
import * as Media from '@react-av/core';
import * as Controls from '@react-av/controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Media.Viewport>
      <Controls.PlayPause />
    </Media.Viewport>
  </Media.Root>
)
```

## Controls.PictureInPicture

The `Controls.PictureInPicture` component is a button that toggles the media player between picture-in-picture and normal states.

It is a `HTMLButtonElement` and accepts all props that a `button` element accepts.

Additionally, it accepts the following props for icon:

- `icon` - The icon to use. Defaults to the `PictureInPicture` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `defaultIconSize` - Size of the default icon if you are using the default icon from the [Phosphor Icons](https://phosphoricons.com/) library. Defaults to `32`.

```jsx
import * as Media from '@react-av/core';
import * as Controls from '@react-av/controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Media.Viewport>
      <Controls.PictureInPicture />
    </Media.Viewport>
  </Media.Root>
)
```

## Controls.Fullscreen

The `Controls.Fullscreen` component is a button that toggles the media player between fullscreen and normal states. 

The `Media.Container` component is the element that is toggled between fullscreen and normal states. Thus all your media player controls should be available in fullscreen mode as long as you use the `Media.Viewport` component to wrap them.

It is a `HTMLButtonElement` and accepts all props that a `button` element accepts.

Additionally, it accepts the following props for icon:

- `fullscreenIcon` - The icon to use when the media player is not in fullscreen mode. Defaults to the `ArrowsOutSimple` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `exitFullscreenIcon` - The icon to use when the media player is in fullscreen mode. Defaults to the `ArrowsInSimple` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `defaultIconSize` - Size of the default icons if you are using the default icons from the [Phosphor Icons](https://phosphoricons.com/) library. Defaults to `32`.

Styling may be done via the props:

- `fullscreenClassName` - The class name to apply when the media player is not in fullscreen mode.
- `exitFullscreenClassName` - The class name to apply when the media player is in fullscreen mode.

Alternatively, use the CSS selectors to style the component:

- `button[data-media-fullscreen-state="fullscreen"]` - The component is in fullscreen mode.
- `button[data-media-fullscreen-state="default"]` - The component is not in fullscreen mode.

```jsx
import * as Media from '@react-av/core';
import * as Controls from '@react-av/controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Media.Viewport>
      <Controls.Fullscreen />
    </Media.Viewport>
  </Media.Root>
)
```

## Controls.Mute

The `Controls.Mute` component is a button that toggles the media player between muted and unmuted states. It also indicates the volume level.

It is a `HTMLButtonElement` and accepts all props that a `button` element accepts.

Additionally, it accepts the following props for icons:

- `mutedIcon` - The icon to use when the media player is muted. Defaults to the `SpeakerSimpleX` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `noneIcon` - The icon to use when the media player is unmuted and the volume is 0. Defaults to the `SpeakerSimpleNone` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `lowIcon` - The icon to use when the media player is unmuted and the volume is between 0 and 0.5. Defaults to the `SpeakerSimpleLow` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `highIcon` - The icon to use when the media player is unmuted and the volume is between 0.5 and 1. Defaults to the `SpeakerSimpleHigh` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `defaultIconSize` - Size of the default icons if you are using the default icons from the [Phosphor Icons](https://phosphoricons.com/) library. Defaults to `32`.

Styling may be done via the props:

- `mutedClassName` - The class name to apply when the media player is muted.
- `noneClassName` - The class name to apply when the media player is unmuted and the volume is 0.
- `lowClassName` - The class name to apply when the media player is unmuted and the volume is between 0 and 0.5.
- `highClassName` - The class name to apply when the media player is unmuted and the volume is between 0.5 and 1.

Alternatively, use the CSS selectors to style the component:

- `button[data-media-mute-state="muted"]` - The component is muted.
- `button[data-media-mute-state="none"]` - The component is unmuted and the volume is 0.
- `button[data-media-mute-state="low"]` - The component is unmuted and the volume is between 0 and 0.5.
- `button[data-media-mute-state="high"]` - The component is unmuted and the volume is between 0.5 and 1.

```jsx
import * as Media from '@react-av/core';
import * as Controls from '@react-av/controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Media.Viewport>
      <Controls.Mute />
    </Media.Viewport>
  </Media.Root>
)
```

## Controls.Loop

The `Controls.Loop` component is a button that toggles the media player between looped and non-looped states.

It is a `HTMLButtonElement` and accepts all props that a `button` element accepts.

Additionally, it accepts the following props for icon:

- `icon` - The icon to use. Defaults to the `Repeat` icon from the [Phosphor Icons](https://phosphoricons.com/) library.
- `defaultIconSize` - Size of the default icon if you are using the default icon from the [Phosphor Icons](https://phosphoricons.com/) library. Defaults to `32`.

Styling may be done via the props:

- `activeClassName` - The class name to apply when the media player is looped.

Alternatively, use the CSS selectors to style the component:

- `button[data-media-loop-state="loop"]` - The component is looped.
- `button[data-media-loop-state="default"]` - The component is not looped.

```jsx
import * as Media from '@react-av/core';
import * as Controls from '@react-av/controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Media.Viewport>
      <Controls.Loop />
    </Media.Viewport>
  </Media.Root>
)
```

## Controls.Timestamp

The `Controls.Timestamp` component is a component that displays the current timestamp of the media player. It formats the timestamp for you in the format `HH:MM:SS`.

You must choose the type of typestamp via the `type` prop. The options are:

- `remaining` - Displays the remaining time of the media.
- `elapsed` - Displays the elapsed time of the media.
- `duration` - Displays the duration of the media.

It is a `HTMLSpanElement` and accepts all props that a `span` element accepts.

```jsx
import * as Media from '@react-av/core';
import * as Controls from '@react-av/controls';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Media.Viewport>
      <Controls.Timestamp type="remaining" />
    </Media.Viewport>
  </Media.Root>
)
```
