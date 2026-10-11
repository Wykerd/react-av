---
title: React AV vs Vidstack, Media Chrome, and Video.js
description: Compare React AV with Vidstack, Media Chrome, and Video.js on approach, React support, HLS and DASH, captions, subtitle editing, bundle size, license, and maintenance.
layout: ../../layouts/MainLayout.astro
---

The teams behind [Vidstack](https://vidstack.io), [Media Chrome](https://www.media-chrome.org), Plyr, and [Video.js](https://videojs.org) now build one player together. That player, Video.js 10, went stable on 1 October 2026. It is the closest alternative to React AV, because it also gives you unstyled React components and hooks.

Vidstack and Media Chrome still publish their own packages, and the `video.js` package on npm still installs Video.js 8, so this page compares React AV with all four. The details come from each project's own docs, repository, and npm packages as they stood in October 2026. Video.js 10 is new, so follow the links before you rely on a detail.

## At a glance

| Feature | React AV | Vidstack | Media Chrome | Video.js 10 | Video.js 8 |
| --- | --- | --- | --- | --- | --- |
| Approach | Headless components and hooks | Components, hooks, and layouts | Web components | Unstyled components, hooks, and skins | Styled player |
| React | React only | React package | React wrappers | React package | No official package |
| HLS and DASH | Shaka Player | hls.js, dash.js | hls.js, dash.js, Shaka Player | hls.js, SPF, dash.js (unstable), Shaka Player (unstable) | Built in (VHS) |
| Captions | Own WebVTT renderer | Own renderer | Browser | Browser | vtt.js, browser on Safari and iOS |
| Subtitle editing | Timeline editor | No | No | No | No |
| License | MIT | MIT | MIT | Apache 2.0 | Apache 2.0 |
| Status | Pre-1.0, last release June 2025 | Security fixes only | Maintained | Stable | Fixes only |

## Approach

React AV is a set of headless React components and hooks. `Media.Root` holds the media state, and hooks such as `useMediaPlaying` read and change it from any component inside the root. Nothing ships with styles and there is no prebuilt skin, so you write the layout and CSS.

Vidstack has UI components and hooks, plus two prebuilt layouts, Default and Plyr, that you restyle with CSS. You can also build your own layout from the components. See the [installation guide](https://vidstack.io/docs/player/getting-started/installation/react).

Media Chrome is a set of custom elements, such as `<media-play-button>`, that you arrange in HTML and style with CSS. They work with `<video>`, `<audio>`, and [compatible media elements](https://www.media-chrome.org/docs/en/media-element) for sources such as HLS and YouTube.

Video.js 10 splits a player into a state store, unstyled UI components, and media components. You pick the features the store includes. For the UI, you either use a packaged skin or copy the skin's source into your project with the shadcn CLI. See [Why Video.js?](https://videojs.org/docs/framework/react/guides/why-videojs) and [Customize skins](https://videojs.org/docs/framework/react/how-to/customize-skins).

Video.js 8 is a complete, styled player. You configure it through a JavaScript API and extend it with community plugins. Its documentation is at [legacy.videojs.org](https://legacy.videojs.org).

## React integration

- React AV's published packages support React 18.3, and the next release adds React 19. There is no web component build and no bindings for other frameworks.
- Vidstack ships [`@vidstack/react`](https://www.npmjs.com/package/@vidstack/react) with React components and hooks such as `useMediaState`. The same component logic runs Vidstack's web components, which other frameworks use.
- Media Chrome has [React wrappers](https://www.media-chrome.org/docs/en/react/get-started) for each element in `media-chrome/react`. For custom controls, `media-chrome/react/media-store` exports [`useMediaSelector` and `useMediaDispatch`](https://www.media-chrome.org/docs/en/react/hooks).
- Video.js 10 ships [`@videojs/react`](https://www.npmjs.com/package/@videojs/react) with React components and hooks. `usePlayer` takes a selector and re-renders the component only when the selected state changes. `@videojs/html` has custom elements for use outside React.
- Video.js 8 has no official React package. Its [React guide](https://legacy.videojs.org/guides/react/) creates the player in an effect and disposes of it on unmount.

## HLS and DASH

- React AV plays HLS and DASH through Shaka Player in the optional [`@react-av/shaka`](/en/core-other-sources/) package. When the browser can play a stream natively, it uses native playback instead.
- Vidstack plays HLS with hls.js and DASH with dash.js. It loads both from jsDelivr by default, or you can install and import them yourself. See the [HLS provider](https://vidstack.io/docs/player/api/providers/hls).
- Media Chrome streams through separate media elements. `hls-video-element` uses hls.js, `dash-video-element` uses dash.js, and `shaka-video-element` uses Shaka Player. See [HLS Video](https://www.media-chrome.org/docs/en/media-elements/hls-video).
- Video.js 10 has a media component for each engine: hls.js, native HLS, dash.js, Shaka Player, and its own SPF engine. The [installation guide](https://videojs.org/docs/guides/installation/react) uses hls.js for broad compatibility. SPF does not yet handle ads or true low-latency live streams. The Video.js team marks the dash.js and Shaka Player components as [unstable APIs](https://videojs.org/docs/framework/react/reference/components/dash-video), so their configuration can change in a minor release. See [Media sources](https://videojs.org/docs/framework/react/guides/media-sources) and the [10.0 announcement](https://videojs.org/blog/videojs-10).
- Video.js 8 includes HLS and DASH in its default bundle through VHS, published as `@videojs/http-streaming`.

## Captions and text tracks

React AV parses and renders WebVTT itself with `@react-av/vtt-core`, following the [W3C WebVTT](https://www.w3.org/TR/webvtt1/) rendering rules. Captions look the same in every browser, inline or in element fullscreen. Chapters and storyboard thumbnails use WebVTT too.

React AV reads only the WebVTT files you add with `Track`. It does not read SRT or SSA files, or captions embedded in HLS and DASH manifests.

iPhone is the exception. Its native video fullscreen and picture-in-picture windows show only the browser's own text tracks, so React AV captions do not appear there. In the published 0.0.5 packages, the Fullscreen control does not work on iPhone at all. The next release makes it open native video fullscreen.

- Vidstack renders captions with its own [media-captions](https://github.com/vidstack/media-captions) library, which reads WebVTT, SRT, SSA/ASS, and JSON. An optional libass renderer handles advanced SSA/ASS styling, and the HLS provider loads captions embedded in HLS playlists. See [text track formats](https://vidstack.io/docs/player/core-concepts/loading#text-track-formats).
- Media Chrome turns the media element's text tracks on and off, and the browser renders the cues. See the [captions menu](https://www.media-chrome.org/docs/en/components/media-captions-menu).
- Video.js 10 mirrors the media element's text tracks into player state, including tracks from HLS manifests. The browser renders the cues, and you style them with `::cue`. See [Show captions and subtitles](https://videojs.org/docs/framework/react/guides/captions).
- Video.js 8 renders captions with vtt.js. In Safari and on iOS it uses the browser's text tracks by default, as the Html5 tech's [`supportsNativeTextTracks`](https://github.com/videojs/video.js/blob/v8.24.1/src/js/tech/html5.js#L1222) check shows.

## Subtitle and timeline editing

React AV is the only one of these with an editor. `@react-av/editor` puts a subtitle timeline next to the video, where you select, retime, create, and delete cues, then export WebVTT with `toVTT`. See the [subtitle editor guide](/en/subtitle-editor/).

Vidstack, Media Chrome, and Video.js display text tracks but ship no editing components. If you need an editor, you build it on their text track APIs.

## Bundle size

Each part of React AV is a separate package, so you install only the parts you use. [Bundle size](/en/browser-support/#bundle-size) lists the measured size of each package. Adding HLS and DASH brings in Shaka Player, because `@react-av/shaka` imports Shaka's full compiled build.

The Video.js team published [size measurements](https://videojs.org/blog/videojs-v10-beta-hello-world-again#bundle) with its v10 beta in March 2026. For a player without adaptive streaming, it measured these gzipped sizes:

- Video.js 8 core: 75.2 kB
- Vidstack: 74.1 kB
- Media Chrome: 41.3 kB
- Video.js 10 video player: 25.1 kB for HTML, 18.0 kB for React

Streaming engines are often bigger than the player itself. The same post measured hls.js at 155.9 kB, Shaka Player at 239.1 kB, and dash.js at 294.2 kB gzipped. Video.js 8's default bundle, which includes VHS, came to 202.7 kB, and the Video.js 10 React player with SPF came to 31.6 kB. The [10.0 announcement](https://videojs.org/blog/videojs-10) reports a bundle 60% smaller than Video.js 8's default, based on its release candidate benchmarks.

## License

React AV, Vidstack, and Media Chrome use the MIT license. Video.js 8 and Video.js 10 use the Apache 2.0 license.

## Maintenance

- React AV is pre-1.0, with versions in the `0.0.x` range, so APIs can change between releases. The latest npm release, [`@react-av/core` 0.0.5](https://www.npmjs.com/package/@react-av/core), came out in June 2025. A small team still develops it on [GitHub](https://github.com/Wykerd/react-av), and the fixes made since then ship in the next release.
- Vidstack gets [security fixes only](https://github.com/vidstack/player#readme). Its 1.x line receives priority security patches until January 2028 and nothing else. The README links to migration guides for Video.js 10.
- Media Chrome still publishes releases. [4.19.3](https://www.npmjs.com/package/media-chrome) came out in September 2026. Its team now works on Video.js 10, and the [README](https://github.com/muxinc/media-chrome#readme) points new projects there.
- Video.js 10 has been stable since 10.0.0 on 1 October 2026. It follows semantic versioning, except for APIs marked as unstable. The [v10 roadmap](https://videojs.org/docs/framework/react/guides/v10-roadmap) plans ads, general analytics integrations, and plugin migration for 10.x releases.
- Video.js 8 gets bug fixes and critical security patches, with no new features. From 2027 it gets security patches only, according to the same roadmap.

## When to choose React AV

- Your player UI is React, and you want hooks such as `useMediaPlaying` to read and control playback from any component, with your own markup and CSS.
- You want WebVTT captions to render the same way in every browser, and your viewers do not depend on iPhone fullscreen or picture-in-picture.
- People need to edit subtitles in the same app that plays the video.

## When to choose something else

- **You want a finished, styled player.** React AV has no default skin. Video.js 10 has ready-made skins, and you can still edit their source.
- **Your app is not only React.** Media Chrome and Video.js 10 have web components that work in any framework or in plain HTML.
- **You need quality or audio track menus, live stream controls, casting, or YouTube and Vimeo sources.** React AV has no components for these. Video.js 10 has [quality](https://videojs.org/docs/framework/react/guides/quality) and [audio track](https://videojs.org/docs/framework/react/reference/components/audio-track-radio-group) menus, a [live button](https://videojs.org/docs/framework/react/reference/components/live-button), [casting](https://videojs.org/docs/framework/react/guides/casting), and [YouTube and Vimeo media](https://videojs.org/docs/framework/react/guides/media-sources). Video.js 8 plugins cover ads and analytics today. Video.js 10 already ships [Mux Data](https://videojs.org/docs/framework/react/guides/mux-data), and general ads and analytics integrations are on its roadmap.
- **You want a small HLS bundle.** React AV's streaming support loads the full Shaka Player build. Video.js 10 can use its SPF engine for simple adaptive streaming, which the Video.js team measured at 12.1 kB gzipped in March 2026.
- **Your captions are SRT, SSA/ASS, or embedded in HLS or DASH manifests.** React AV reads only WebVTT files. Video.js 10 and Vidstack show captions from HLS manifests. Vidstack also reads SRT and SSA/ASS, but it only gets security fixes now.
- **Viewers need captions in iPhone fullscreen or picture-in-picture.** React AV captions do not appear in either, because iPhone shows only the browser's text tracks there. Media Chrome and Video.js 10 use the browser's text tracks, so Safari shows their captions in both.
- **You need a stable 1.0 API or a large community.** React AV is pre-1.0 and a small team maintains it. Video.js 10 follows semantic versioning for its stable APIs, and Video.js has a long-standing community.
