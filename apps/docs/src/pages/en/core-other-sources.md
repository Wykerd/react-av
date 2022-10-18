---
title: HLS and DASH support
description: Add HLS and DASH support to React AV.
layout: ../../layouts/MainLayout.astro
---

We provide two additional packages to add HLS and DASH support to React AV using [hls.js](https://github.com/video-dev/hls.js/) and [dash.js](https://github.com/Dash-Industry-Forum/dash.js/).

## HLS

The `@react-av/hls` package provides a `HLSVideo` and `HLSAudio` components that can be used to play HLS streams.

```bash
npm i @react-av/hls
```

### HLSVideo

The `HLSVideo` component is built on top of the `Media.Video` component and can be used in the same way. You should provide the HLS stream URL as the `src` prop.

```jsx
import * as Media from '@react-av/core';
import { HLSVideo } from '@react-av/hls';

() => (
  <Media.Root>
    <Media.Container>
      <HLSVideo src="https://example.com/video.m3u8" />
    </Media.Container>
  </Media.Root>
);
```

### HLSAudio

Similarly, the `HLSAudio` component is built on top of the `Media.Audio` component and can be used in the same way. You should provide the HLS stream URL as the `src` prop.

```jsx
import * as Media from '@react-av/core';
import { HLSAudio } from '@react-av/hls';

() => (
  <Media.Root>
    <HLSAudio src="https://example.com/audio.m3u8" />
  </Media.Root>
);
```

### useMediaHLS()

The `useMediaHLS()` hook can be used to access the underlying `hls.js` instance. This can be useful for customizing the player.

If the HLS stream is supported natively, like it is in Safari, the hook will return `undefined`.

**Returns:** `Hls | undefined`

## DASH

Coming soon!