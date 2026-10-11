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

### Configuration

Pass a `shakaConfig` prop to configure Shaka Player before the stream loads. It accepts any part of Shaka Player's configuration, the same object `player.configure()` takes, and is typed as `Shaka.ShakaConfig`. The `onPlayerReady` prop receives the `shaka.Player` once the stream has loaded. Define both outside the component or memoise them, because a new value reloads the stream.

```tsx
import * as Media from '@react-av/core';
import * as Shaka from '@react-av/shaka';

const shakaConfig: Shaka.ShakaConfig = {
  streaming: { bufferingGoal: 30 },
  abr: { restrictions: { maxHeight: 1080 } },
};

() => (
  <Media.Root>
    <Media.Container>
      <Shaka.Video src="https://example.com/video.mpd" shakaConfig={shakaConfig} controls playsInline />
    </Media.Container>
  </Media.Root>
);
```

Types come from the typings bundled with `shaka-player`, so no extra type package is needed. Use the Shaka Player 4.15 line from 4.15.30, the 4.x line from 4.16.18, or Shaka 5 from 5.0.2. Earlier releases have missing or broken bundled declarations and are no longer supported.

### useMediaShaka()

The `useMediaShaka()` hook can be used to access the underlying `shaka-player` instance. This can be useful for customizing the player.

If the stream is natively supported, the hook returns `null`.

**Returns:** `shaka.Player | null`

## Hosting and browser requirements

- Render interactive players in the browser. In Astro, use a client-only island; in a server-rendered React framework, load the player with server rendering disabled.
- Serve manifests and media segments over HTTPS. A cross-origin stream server must allow requests from your application's origin, including requests for segments and encryption keys when used.
- HLS and DASH describe delivery formats. Playback still depends on the browser's support for the codecs in your stream; check the actual target devices.
- Use [useMediaError](/en/core-hooks/#usemediaerror) to show playback failures in your interface. Inspect the browser's network panel if manifests or segments cannot load.

For subtitles alongside a stream, follow the [WebVTT captions guide](/en/text-track-introduction/).

### useMediaShakaQualities()

Use this hook inside a media root to build a quality picker. It returns `qualities` (each with `id`, `height`, and `bitrate`), `active`, `automatic`, and `selectQuality(quality | "auto")`. Choosing a rendition turns automatic selection off; choosing `"auto"` enables it again. A small buffer remains during a switch so playback can continue. Native playback has an empty quality list because Shaka does not manage that stream.

```tsx
function QualityPicker() {
  const { qualities, active, automatic, selectQuality } = Shaka.useMediaShakaQualities();
  return (
    <select
      aria-label="Video quality"
      value={automatic ? "auto" : active?.id ?? "auto"}
      onChange={event => {
        const quality = qualities.find(quality => quality.id === Number(event.target.value));
        selectQuality(quality ?? "auto");
      }}
    >
      <option value="auto">Automatic</option>
      {qualities.map(quality => <option key={quality.id} value={quality.id}>{quality.height}p</option>)}
    </select>
  );
}
```

Each player manages its own quality choice. The list groups renditions with the same height and video bitrate, and keeps the active audio language when switching video.
