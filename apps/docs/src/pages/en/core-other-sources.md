---
title: HLS and DASH support
description: Add HLS and DASH support to React AV.
layout: ../../layouts/MainLayout.astro
---

We provide support for HLS and DASH through [Shaka Player](https://github.com/shaka-project/shaka-player) as integrated into the `@react-av/shaka` package.

## Shaka

The `@react-av/shaka` package provides a `Video` and `Audio` components that can be used to play both HLS and DASH streams.

Safari uses native HLS playback when available. Recognized, natively playable media files such as MP4 also bypass Shaka. Shaka is imported only when adaptive playback needs it, allowing bundlers with code splitting to keep it out of the initial download. Use `format="native"` for native sources whose URLs do not identify their format.

Changing `src` releases the previous player before attaching its replacement. A component ref exposes `retry()`, which reloads either the native source or the active Shaka player.

Shaka failures are available through `useMediaShakaError()` and the optional `onPlayerError(error)` callback. Native media failures remain available through `Media.useMediaError()` and the media element's `onError` event. A failed source does not throw from an asynchronous event handler and tear down the application.

```bash
npm i @react-av/shaka shaka-player
```

### Video

The `Shaka.Video` component is built on top of the `Media.Video` component and can be used in the same way. You should provide the HLS stream URL as the `src` prop.

```jsx
import * as Media from '@react-av/core';
import * as Shaka from '@react-av/shaka';

() => (
  <Media.Root>
    <Media.Container>
      <Shaka.Video src="https://example.com/video.m3u8" />
    </Media.Container>
  </Media.Root>
);
```

### Audio

Similarly, the `Shaka.Audio` component is built on top of the `Media.Audio` component and can be used in the same way. You should provide the HLS stream URL as the `src` prop.

```jsx
import * as Media from '@react-av/core';
import * as Shaka from '@react-av/shaka';

() => (
  <Media.Root>
    <Shaka.Audio src="https://example.com/audio.m3u8" />
  </Media.Root>
);
```

### useMediaShaka()

The `useMediaShaka()` hook can be used to access the underlying `shaka-player` instance. This can be useful for customizing the player.

If the stream is natively supported, the hook returns `null`.

**Returns:** `unknown` - shaka player has some issue exporting the TypeScript types correctly so type inference is not available.
