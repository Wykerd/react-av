---
title: React AV vs Vidstack, Media Chrome, and Video.js
description: Compare React AV with Vidstack, Media Chrome, and Video.js on approach, React support, HLS and DASH, captions, subtitle editing, bundle size, license, and maintenance.
layout: ../../layouts/MainLayout.astro
---

This page compares React AV with three other open-source web media players: [Vidstack Player](https://vidstack.io), [Media Chrome](https://www.media-chrome.org), and [Video.js](https://videojs.org). The details come from each project's documentation, repository, and npm packages, and were checked in October 2026. These projects change quickly, so follow the links before you decide.

The teams behind Vidstack, Media Chrome, Plyr, and Video.js have combined their work into Video.js 10, which became stable on 1 October 2026. Video.js 10 is the alternative closest to React AV, because it also offers unstyled React components and hooks. The `video.js` package on npm is still Video.js 8, so this page covers both versions.

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

**React AV** is a set of headless React components and hooks. `Media.Root` holds the media state, and hooks such as `useMediaPlaying` read and change it from any component inside it. Components ship without styles, and there is no prebuilt player skin: you write the layout and CSS.

**Vidstack** provides UI components and hooks, plus two prebuilt layouts, Default and Plyr, that you customize with CSS. You can also build your own layout from its components. See the [installation guide](https://vidstack.io/docs/player/getting-started/installation/react).

**Media Chrome** provides player controls as custom elements, such as `<media-play-button>`, that you arrange in HTML and style with CSS. They work with `<video>`, `<audio>`, and [compatible media elements](https://www.media-chrome.org/docs/en/media-element) for sources such as HLS and YouTube.

**Video.js 10** splits a player into a state store, unstyled UI components, and media components. You choose which features the store includes, then use a packaged skin or add the skin's source to your project with the shadcn CLI. See [Why Video.js?](https://videojs.org/docs/framework/react/guides/why-videojs) and [Customize skins](https://videojs.org/docs/framework/react/how-to/customize-skins).

**Video.js 8** is a complete, styled player that you configure through a JavaScript API and extend with community plugins. Its documentation is at [legacy.videojs.org](https://legacy.videojs.org).

## React integration

- **React AV**'s published packages support React 18.3. React 19 support is merged and ships in the next release. It has no web component build or bindings for other frameworks.
- **Vidstack** ships [`@vidstack/react`](https://www.npmjs.com/package/@vidstack/react) with React components and hooks such as `useMediaState`. The same component logic powers Vidstack's web components, which other frameworks use.
- **Media Chrome** offers [React wrappers](https://www.media-chrome.org/docs/en/react/get-started) for each element in `media-chrome/react`. For custom controls, `media-chrome/react/media-store` provides [`useMediaSelector` and `useMediaDispatch`](https://www.media-chrome.org/docs/en/react/hooks).
- **Video.js 10** ships [`@videojs/react`](https://www.npmjs.com/package/@videojs/react) with React components and hooks. `usePlayer` with a selector re-renders a component only when the selected state changes. `@videojs/html` provides custom elements for everything else.
- **Video.js 8** has no official React package. Its [React guide](https://legacy.videojs.org/guides/react/) creates the player in an effect and disposes of it on unmount.

## HLS and DASH

- **React AV** plays HLS and DASH with Shaka Player through the optional [`@react-av/shaka`](/en/core-other-sources/) package, and uses native playback when the browser supports the stream.
- **Vidstack** plays HLS with hls.js and DASH with dash.js. By default it loads them from jsDelivr; you can install and import them yourself instead. See the [HLS provider](https://vidstack.io/docs/player/api/providers/hls).
- **Media Chrome** gets streaming from separate media elements: `hls-video-element` uses hls.js, `dash-video-element` uses dash.js, and `shaka-video-element` uses Shaka Player. See [HLS Video](https://www.media-chrome.org/docs/en/media-elements/hls-video).
- **Video.js 10** has a media component for each engine: hls.js, its own lightweight SPF engine, native HLS, dash.js, and Shaka Player. The [installation guide](https://videojs.org/docs/guides/installation/react) uses hls.js for broad compatibility. SPF does not yet support ads or true low-latency live streams. Its dash.js and Shaka Player components are marked as [unstable APIs](https://videojs.org/docs/framework/react/reference/components/dash-video), so their configuration can change in a minor release. See [Media sources](https://videojs.org/docs/framework/react/guides/media-sources) and the [10.0 announcement](https://videojs.org/blog/videojs-10).
- **Video.js 8** includes HLS and DASH in its default bundle through VHS (`@videojs/http-streaming`).

## Captions and text tracks

- **React AV** parses and renders WebVTT itself with `@react-av/vtt-core`, following the [W3C WebVTT](https://www.w3.org/TR/webvtt1/) rendering rules, so captions look the same in every browser while the video is inline or in element fullscreen. iPhone's native video fullscreen and picture-in-picture windows only show the browser's text tracks, so React AV captions do not appear there. In the published 0.0.5 packages the Fullscreen control does not work on iPhone; the next release opens native video fullscreen. It also uses WebVTT for chapters and storyboard thumbnails. It only reads WebVTT files that you add with `Track`: it does not read SRT or SSA files, or captions embedded in HLS and DASH manifests.
- **Vidstack** renders captions with its own [media-captions](https://github.com/vidstack/media-captions) library, which reads WebVTT, SRT, SSA/ASS, and JSON. An optional libass renderer handles advanced SSA/ASS styling. Its HLS provider also loads captions embedded in HLS playlists. See [text track formats](https://vidstack.io/docs/player/core-concepts/loading#text-track-formats).
- **Media Chrome** turns the media element's text tracks on and off, and the browser renders the cues. See the [captions menu](https://www.media-chrome.org/docs/en/components/media-captions-menu).
- **Video.js 10** mirrors the media element's text tracks into player state, including tracks from HLS manifests. The browser renders the cues, which you style with `::cue`. See [Show captions and subtitles](https://videojs.org/docs/framework/react/guides/captions).
- **Video.js 8** renders captions with vtt.js, except in Safari and on iOS, where it uses the browser's text tracks by default. See the Html5 tech's [`supportsNativeTextTracks`](https://github.com/videojs/video.js/blob/v8.24.1/src/js/tech/html5.js#L1222) check.

## Subtitle and timeline editing

React AV's `@react-av/editor` package provides timeline components for editing subtitles next to the video: select, retime, create, and delete cues, then export WebVTT with `toVTT`. See the [subtitle editor guide](/en/subtitle-editor/).

Vidstack, Media Chrome, and Video.js do not include subtitle or timeline editing components. They display text tracks, and any editing interface is yours to build on their text track APIs.

## Bundle size

React AV does not publish bundle size figures. Its packages are separate, so you only install what you use. HLS and DASH support adds Shaka Player: `@react-av/shaka` imports Shaka's full compiled build.

The Video.js team published [size measurements](https://videojs.org/blog/videojs-v10-beta-hello-world-again#bundle) with its v10 beta in March 2026. Gzipped sizes for a player without adaptive streaming:

- Video.js 8 core: 75.2 kB
- Vidstack: 74.1 kB
- Media Chrome: 41.3 kB
- Video.js 10 video player: 25.1 kB (HTML), 18.0 kB (React)

Streaming engines are often the largest part of a player. The same post measured hls.js at 155.9 kB, Shaka Player at 239.1 kB, and dash.js at 294.2 kB gzipped. Video.js 8's default bundle, which includes VHS, measured 202.7 kB, and the Video.js 10 React player with SPF measured 31.6 kB. The [10.0 announcement](https://videojs.org/blog/videojs-10) reports a 60% reduction from Video.js 8's default bundle in its release candidate benchmarks.

## License

React AV, Vidstack, and Media Chrome use the MIT license. Video.js 8 and Video.js 10 use the Apache 2.0 license.

## Maintenance

- **React AV** packages are pre-1.0 (`0.0.x`), so APIs can change between releases. The latest npm release ([`@react-av/core` 0.0.5](https://www.npmjs.com/package/@react-av/core)) was in June 2025. A small team continues development on [GitHub](https://github.com/Wykerd/react-av), and fixes made since then are waiting for the next release.
- **Vidstack** is in [security-only maintenance](https://github.com/vidstack/player#readme): priority security patches for 1.x until January 2028, and nothing else. Its README links to migration guides for Video.js 10.
- **Media Chrome** still publishes releases ([4.19.3](https://www.npmjs.com/package/media-chrome) in September 2026). Its team now works on Video.js 10, and its [README](https://github.com/muxinc/media-chrome#readme) points new projects there.
- **Video.js 10** has been stable since 10.0.0 on 1 October 2026 and follows semantic versioning, except for APIs marked as unstable. Ads, general analytics integrations, and plugin migration are planned for 10.x releases. See the [v10 roadmap](https://videojs.org/docs/framework/react/guides/v10-roadmap).
- **Video.js 8** receives bug fixes and critical security patches, with no new features. From 2027 it receives security patches only, according to the same roadmap.

## When to choose React AV

- You build your interface in React and want playback state as hooks, with your own markup and styles.
- You need WebVTT captions that render the same way in every browser, and your viewers do not rely on iPhone fullscreen or picture-in-picture.
- You need a subtitle timeline editor in the same application as the player.

## When React AV is not the best fit

- **You want a finished, styled player.** React AV has no default skin. Video.js 10 skins give you one immediately, and you can still edit their source.
- **Your application is not only React.** Media Chrome and Video.js 10 provide web components that work in any framework or in plain HTML.
- **You need quality or audio track menus, live stream controls, casting, or YouTube and Vimeo sources.** React AV has no components for these. Video.js 10 has [quality](https://videojs.org/docs/framework/react/guides/quality) and [audio track](https://videojs.org/docs/framework/react/reference/components/audio-track-radio-group) menus, a [live button](https://videojs.org/docs/framework/react/reference/components/live-button), [casting](https://videojs.org/docs/framework/react/guides/casting), and [YouTube and Vimeo media](https://videojs.org/docs/framework/react/guides/media-sources). Ads and general analytics integrations are on the Video.js 10 roadmap ([Mux Data](https://videojs.org/docs/framework/react/guides/mux-data) already ships), and Video.js 8 plugins cover them today.
- **Bundle size matters for HLS.** React AV's streaming support loads the full Shaka Player build. Video.js 10 can use its SPF engine for simple adaptive streaming, which the Video.js team measured at 12.1 kB gzipped in March 2026.
- **Your captions are SRT or SSA/ASS, or embedded in HLS or DASH manifests.** React AV only reads WebVTT files. Video.js 10 and Vidstack show captions from HLS manifests, and Vidstack also reads SRT and SSA/ASS but only receives security fixes.
- **Viewers need fullscreen or picture-in-picture captions on iPhone.** In the published 0.0.5 packages the Fullscreen control does not work on iPhone. The next release opens the browser's native video fullscreen, which, like picture-in-picture, only shows the browser's text tracks, so React AV captions are hidden there. Media Chrome and Video.js 10 use browser text tracks, so Safari shows their captions in both.
- **You need a stable 1.0 API or a large community.** React AV is pre-1.0 and maintained by a small team. Video.js 10 follows semantic versioning for its stable APIs, and Video.js has a long-standing community.
