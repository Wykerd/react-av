---
title: React AV Browser Support and Bundle Size
description: See which browsers support React AV fullscreen, picture-in-picture, captions, and HLS and DASH playback, and how much each React AV package adds to your bundle.
layout: ../../layouts/MainLayout.astro
---

React AV builds on the browser's media element and a few web platform APIs. This page lists the browser versions that support each feature and the size each package adds to your JavaScript bundle. Versions come from [MDN's browser compatibility data](https://github.com/mdn/browser-compat-data) and [caniuse](https://caniuse.com), checked in October 2026.

## Browser support

| Feature | Chrome | Edge | Firefox | Safari | iPad | iPhone |
| --- | --- | --- | --- | --- | --- | --- |
| Playback state and controls | Yes | Yes | Yes | Yes | Yes | Yes |
| Fullscreen | Yes | Yes | Yes | Yes | 12 | Video only |
| Picture-in-picture | 70 | 79 | 153 | 13.1 | 14 | 14 |
| Captions, chapters, and storyboards | 64 | 79 | 63 | 14 | 14 | 14 |
| HLS | Native from 142 | Shaka Player | Shaka Player | Native | Native | Native |
| DASH | Shaka Player | Shaka Player | Shaka Player | Shaka Player | Shaka Player from 13 | Shaka Player from 17.1 |

Numbers are the first version with support. The iPad and iPhone columns show iPadOS and iOS versions. The table covers the browser APIs React AV uses. Your bundler's target, and dependencies such as React Aria in `@react-av/sliders`, can require newer JavaScript syntax support.

- **Playback state and controls** follow the media element's [events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events), which every browser supports.
- **Fullscreen** puts `Media.Container` in fullscreen with the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen#browser_compatibility), or its prefixed versions in older browsers, so your controls and React AV captions stay visible. iPhone cannot make an element fullscreen, so React AV opens the video in Safari's own fullscreen player with [`webkitEnterFullscreen`](https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1633500-webkitenterfullscreen). That player shows Safari's controls and the browser's text tracks instead of yours. In the published 0.0.5 packages the Fullscreen control does not work on iPhone; the next release adds this fallback.
- **Picture-in-picture** uses the [Picture-in-Picture API](https://caniuse.com/picture-in-picture). The `PictureInPicture` control only renders when the browser supports it, so it stays hidden in Firefox before 153. React AV does not use Safari's older `webkitSetPresentationMode` API. React AV captions do not appear in the picture-in-picture window.
- **Captions, chapters, and storyboards** use `@react-av/vtt-core`, which renders cues with [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry#browser_compatibility) and extends `EventTarget` for its tracks and cues. Extending `EventTarget` needs its [constructor](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget#browser_compatibility), which Safari added in version 14.
- **HLS and DASH**: `@react-av/shaka` plays a stream natively when the video element reports support for its format, and loads it with Shaka Player otherwise. Shaka Player needs [Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource#browser_compatibility), or [ManagedMediaSource](https://developer.mozilla.org/en-US/docs/Web/API/ManagedMediaSource#browser_compatibility) on iPhone. The browser must also support your stream's codecs. See Shaka Player's [browser support matrix](https://github.com/shaka-project/shaka-player#platform-and-browser-support-matrix).

We also ran the homepage player in Playwright's Chromium 156, Firefox 157, and WebKit 27.2. Playback, mute, captions, and fullscreen worked in all three, and picture-in-picture worked in Chromium and Firefox. Playwright's WebKit cannot open picture-in-picture, so Safari's picture-in-picture support comes from caniuse alone.

## Bundle size

Each package is published separately, so you only add the packages you import. Sizes include everything a package exports and its own dependencies, such as the Phosphor icons in `@react-av/controls`. They do not include peer dependencies, such as React or the React AV packages a package builds on.

| Package | Minified and gzipped |
| --- | --- |
| `@react-av/core` | 4.4 kB |
| `@react-av/controls` | 7.5 kB |
| `@react-av/sliders` | 3.9 kB |
| `@react-av/vtt-core` | 24.3 kB |
| `@react-av/vtt` | 1.6 kB |
| `@react-av/vtt-controls` | 1.2 kB |
| `@react-av/shaka` | 1.6 kB |
| `@react-av/editor` | 11.4 kB |

Two packages need a larger peer dependency that you install yourself. `@react-av/sliders` uses `@radix-ui/react-slider`, which adds 9.9 kB, and `@react-av/shaka` imports the compiled build of Shaka Player 5.2, which adds 270.1 kB. `@react-av/vtt-core` is the largest React AV package because it includes a complete WebVTT parser and renderer, and the table of HTML character references used to decode cue text.

Measured in October 2026 by bundling each package's built ESM entry from the `master` branch with esbuild 0.28, minified, in production mode, with peer dependencies left external, then gzipping the output at level 9.
