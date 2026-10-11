---
title: React AV Browser Support and Bundle Size
description: See which browsers support React AV fullscreen, picture-in-picture, captions, and HLS and DASH playback, and how much each React AV package adds to your bundle.
layout: ../../layouts/MainLayout.astro
---

React AV uses the browser's own media element and a handful of web platform APIs. The table below shows which browsers support each feature, using [MDN's browser compatibility data](https://github.com/mdn/browser-compat-data) and [caniuse](https://caniuse.com) as of October 2026. The [bundle size](#bundle-size) section lists how much each package adds to your JavaScript bundle.

## Browser support

| Feature | Chrome | Edge | Firefox | Safari | iPad | iPhone |
| --- | --- | --- | --- | --- | --- | --- |
| Playback state and controls | Yes | Yes | Yes | Yes | Yes | Yes |
| Fullscreen | Yes | Yes | Yes | Yes | 12 | Video only |
| Picture-in-picture | 70 | 79 | 153 | 13.1 | 14 | 14 |
| Captions, chapters, and storyboards | 64 | 79 | 63 | 14 | 14 | 14 |
| HLS | Native from 142 | Shaka Player | Shaka Player | Native | Native | Native |
| DASH | Shaka Player | Shaka Player | Shaka Player | Shaka Player | Shaka Player from 13 | Shaka Player from 17.1 |

Numbers are the first version with support, and the iPad and iPhone columns use iPadOS and iOS versions. The table covers only the browser APIs React AV calls. Your bundler's target and dependencies, such as React Aria in `@react-av/sliders`, can need newer JavaScript syntax.

- Playback state and controls follow the media element's [events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events), which every browser supports.
- Fullscreen puts `Media.Container` into fullscreen with the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen#browser_compatibility), or its prefixed version in older browsers, so your controls and React AV captions stay on screen. iPhone cannot make an element fullscreen. There, React AV opens the video in Safari's own fullscreen player with [`webkitEnterFullscreen`](https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1633500-webkitenterfullscreen), which shows Safari's controls and the browser's text tracks instead of yours. The published 0.0.5 packages lack this fallback, so the Fullscreen control does not work on iPhone until the next release.
- Picture-in-picture uses the [Picture-in-Picture API](https://caniuse.com/picture-in-picture). The `PictureInPicture` control renders only when the browser supports the API, so Firefox before 153 never shows it. React AV does not use Safari's older `webkitSetPresentationMode` API, and React AV captions do not appear in the picture-in-picture window.
- Captions, chapters, and storyboards use `@react-av/vtt-core`. It renders cues with [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry#browser_compatibility), and its tracks and cues extend `EventTarget`. That needs the `EventTarget` [constructor](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget#browser_compatibility), which Safari added in version 14.
- HLS and DASH go through `@react-av/shaka`. If the video element reports support for the stream's format, it plays natively. Otherwise Shaka Player loads the stream, which needs [Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource#browser_compatibility), or [ManagedMediaSource](https://developer.mozilla.org/en-US/docs/Web/API/ManagedMediaSource#browser_compatibility) on iPhone. The browser must also support your stream's codecs. See Shaka Player's [browser support matrix](https://github.com/shaka-project/shaka-player#platform-and-browser-support-matrix).

In Playwright's Chromium 156, Firefox 157, and WebKit 27.2, the homepage player's playback, mute, captions, and fullscreen all worked. Picture-in-picture worked in Chromium and Firefox. Playwright's WebKit cannot open picture-in-picture, so Safari's picture-in-picture numbers come from caniuse alone.

## Bundle size

Each React AV package ships separately, so your bundle includes only the packages you import. The sizes below cover everything a package exports plus its own dependencies, such as the Phosphor icons in `@react-av/controls`. They leave out its peer dependencies, such as React and the other React AV packages it builds on.

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

Two packages also rely on a large peer dependency that you install yourself, which adds to the sizes above. `@react-av/sliders` uses `@radix-ui/react-slider`, which adds 9.9 kB, and `@react-av/shaka` imports the compiled build of Shaka Player 5.2, which adds 270.1 kB.

`@react-av/vtt-core` is the largest React AV package. It contains a complete WebVTT parser and renderer, plus the table of HTML character references it uses to decode cue text.

To reproduce these numbers, bundle each package's built ESM entry from the `master` branch with esbuild 0.28. Use production mode, minify the output, and keep peer dependencies out of the bundle. Then gzip the result at level 9. The figures above come from doing this in October 2026.
