<div align="center">

# React AV

**Headless, hooks-based building blocks for audio and video in React.**

[![npm](https://img.shields.io/npm/v/@react-av/core?label=%40react-av%2Fcore&color=111)](https://www.npmjs.com/package/@react-av/core)
[![License: MIT](https://img.shields.io/badge/license-MIT-111)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/types-included-111)](https://www.typescriptlang.org/)

[Documentation](https://react-av.wykerd.dev/en/introduction) · [Live demos](https://react-av.wykerd.dev) · [Issues](https://github.com/Wykerd/react-av/issues)

</div>

---

React AV gives you the state, behaviour, and accessibility of a full media player with no markup or styles imposed. You compose the primitives you need and style them however you like. It works with plain HTML5 media, HLS, and DASH, and ships with its own WebVTT engine and a subtitle timeline editor.

## Features

- **Headless.** Every component is unstyled and accepts the props of the element it renders.
- **Hooks for everything.** Read and control playback, volume, buffering, fullscreen, and more from any component.
- **Bring your own source.** HTML5 `<video>`/`<audio>` out of the box, with HLS and DASH through Shaka Player.
- **WebVTT built in.** A standalone W3C WebVTT parser and renderer for captions, chapters, and storyboards.
- **Timeline editor.** Composable components for building subtitle and media editing interfaces.
- **Cross-browser.** Fullscreen and picture-in-picture are normalised across browsers.
- **Typed.** Written in TypeScript with declarations included.

## Quick start

```bash
npm i @react-av/core @react-av/controls
```

```tsx
import * as Media from "@react-av/core";
import { PlayPause, Mute, Timestamp, Fullscreen } from "@react-av/controls";

export function Player() {
  return (
    <Media.Root>
      <Media.Container>
        <Media.Video src="/video.mp4" />
      </Media.Container>
      <Media.Viewport>
        <PlayPause />
        <Timestamp type="remaining" />
        <Mute />
        <Fullscreen />
      </Media.Viewport>
    </Media.Root>
  );
}
```

Every piece of media state is a hook, so building your own controls takes a few lines:

```tsx
function PlayButton() {
  const [playing, setPlaying] = Media.useMediaPlaying();
  return <button onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</button>;
}
```

## Packages

| Package | Description |
| --- | --- |
| [`@react-av/core`](./packages/core) | Media root, video/audio elements, viewport, and state hooks. |
| [`@react-av/controls`](./packages/controls) | Play/pause, mute, loop, fullscreen, picture-in-picture, and timestamp controls. |
| [`@react-av/sliders`](./packages/sliders) | Seek and volume sliders built on Radix UI. |
| [`@react-av/vtt-core`](./packages/vtt-core) | Standalone W3C WebVTT parser and renderer. |
| [`@react-av/vtt`](./packages/vtt) | WebVTT tracks, cues, and caption overlays for React AV. |
| [`@react-av/vtt-controls`](./packages/vtt-controls) | Storyboard thumbnail previews from WebVTT tracks. |
| [`@react-av/shaka`](./packages/shaka) | HLS and DASH playback powered by Shaka Player. |
| [`@react-av/editor`](./packages/editor) | Timeline editor components for subtitles and media. |

Every package except `@react-av/vtt-core` has `react` and `react-dom` as peer dependencies.

## Development

This is a [pnpm](https://pnpm.io) workspace managed with [Turborepo](https://turbo.build).

```bash
pnpm install
pnpm build        # build all packages and the docs site
pnpm dev          # watch packages and run the docs site locally
```

The documentation and demo site lives in [`apps/docs`](./apps/docs). Releases are versioned with [Changesets](https://github.com/changesets/changesets): run `pnpm changes` to describe your change before opening a pull request.

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first so we can agree on the approach.

## License

[MIT](./LICENSE) © [Daniel Wykerd](https://wykerd.dev)
