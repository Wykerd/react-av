---
title: React HLS and DASH Player
description: Play HLS and MPEG-DASH streams in React with Shaka Player, native media support, and React AV playback controls and hooks.
layout: ../../layouts/MainLayout.astro
---

We provide support for HLS and DASH through [Shaka Player](https://github.com/shaka-project/shaka-player) as integrated into the `@react-av/shaka` package.

HLS uses an `.m3u8` manifest; MPEG-DASH uses an `.mpd` manifest. React AV uses native playback when the browser supports the source, and Shaka Player otherwise. You supply the stream URL and hosting.

## Shaka

The `@react-av/shaka` package provides a `Video` and `Audio` components that can be used to play both HLS and DASH streams.

```bash
npm i @react-av/core @react-av/shaka shaka-player
```

### Video

The `Shaka.Video` component is built on top of `Media.Video`. Place it inside `Media.Root` and `Media.Container`, then pass an HLS or DASH manifest URL as `src`. This example uses native controls so you can immediately play, pause, and seek.

```jsx
import * as Media from '@react-av/core';
import * as Shaka from '@react-av/shaka';

() => (
  <Media.Root>
    <Media.Container>
      <Shaka.Video src="https://example.com/video.m3u8" controls playsInline />
    </Media.Container>
  </Media.Root>
);
```

Replace the example URL with your stream. For MPEG-DASH, use a URL such as `https://example.com/video.mpd`. To design your own interface, replace `controls` with [React AV media controls](/en/controls/).

### Audio

Similarly, the `Shaka.Audio` component is built on top of the `Media.Audio` component and can be used in the same way. You should provide the HLS stream URL as the `src` prop.

```jsx
import * as Media from '@react-av/core';
import * as Shaka from '@react-av/shaka';

() => (
  <Media.Root>
    <Shaka.Audio src="https://example.com/audio.m3u8" controls />
  </Media.Root>
);
```

### useMediaShaka()

The `useMediaShaka()` hook can be used to access the underlying `shaka-player` instance. This can be useful for customizing the player.

If the stream is natively supported, the hook returns `null`.

**Returns:** `unknown` - shaka player has some issue exporting the TypeScript types correctly so type inference is not available.

## Hosting and browser requirements

- Render interactive players in the browser. In Astro, use a client-only island; in a server-rendered React framework, load the player with server rendering disabled.
- Serve manifests and media segments over HTTPS. A cross-origin stream server must allow requests from your application's origin, including requests for segments and encryption keys when used.
- HLS and DASH describe delivery formats. Playback still depends on the browser's support for the codecs in your stream; check the actual target devices.
- Use [useMediaError](/en/core-hooks/#usemediaerror) to show playback failures in your interface. Inspect the browser's network panel if manifests or segments cannot load.

For subtitles alongside a stream, follow the [WebVTT captions guide](/en/text-track-introduction/).
