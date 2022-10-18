---
title: Introduction
description: WebVTT Introduction for React AV.
layout: ../../layouts/MainLayout.astro
---

React AV features a fully-featured and spec compliant [W3C WebVTT](https://www.w3.org/TR/webvtt1/) parser and renderer. This not only allows for the rendering of captions and subtitles, but also for the rendering of chapters and metadata such as storyboards.

## Installation

WebVTT support is included in the `@react-av/vtt` package. This package is dependant on both `@react-av/core` and `@react-av/vtt-core` packages.

You can install it using your package manager of choice:

```bash
npm i @react-av/vtt-core @react-av/vtt
```

For more info on the `@react-av/vtt-core` package, see the [Text Track Implementation](/en/webvtt) page of the docs.

## WebVTT Subtitles

React AV implements the WebVTT rendering algorithm as defined in the [W3C WebVTT specification](https://www.w3.org/TR/webvtt1/). This means that you can use any WebVTT file to render subtitles and captions. Your captions should render the same way on all browsers and devices.

To use WebVTT subtitles, you should not use the native browser `<track>` element. Instead, you should use our `Track` component provided by `@react-av/vtt`. This component accepts a `src` prop which should be a URL to your WebVTT file.

Our HLS and DASH modules also correctly pass along any WebVTT tracks that are included in the manifest to the vtt module if it is installed. **(Coming soon)**

```jsx
import * as Media from '@react-av/core';
import { Track } from '@react-av/vtt';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="https://example.com/video.mp4" />
    </Media.Container>
    <Track src="https://example.com/subtitles.vtt" />
  </Media.Root>
);
```

The `Track` component accepts a `kind` prop which can be used to specify the type of track. The default value is `subtitles`. The following values are supported: `"subtitles" | "captions" | "descriptions" | "chapters" | "metadata"`.

<!-- TODO: more detailed props explaination -->

Additionally it is suggested to provide a `label` prop to provide a human readable name for the track, as well as a `language` prop to identify the language of the track. This is useful for accessibility and for users to select the correct track.

If you wish to programmatically access the text track, provide it a `id` prop. This will allow you to access the track using the `useMediaTextTrack(id)` hook.

## WebVTT Styling

WebVTT supports styling of captions and subtitles using CSS. This allows you to customize the look and feel of your captions and subtitles.

Our implementation does not yet support this, but will **very soon**.

## WebVTT Chapters

WebVTT also supports the rendering of chapters. This allows you to provide a list of chapters for your video. This can be useful for users to skip to a specific part of the video.

<!-- TODO: once our chapter support is done, include more docs here -->

Our underlying implementation in `@react-av/vtt-core` does support chapters, but we do not yet have a prebuilt component to render them. This will be added **very soon**.

## WebVTT Storyboards

WebVTT allows for timed metadata to be included. This can be used to provide storyboards for your video. Storyboards are a grid of images taken at regular intervals throughout the video. This is usally used for seek previews while scrubbing or hovering over the progress bar.

Your WebVTT file should consist of a series of cues each containing a URL to a resource. The resource should be an image. The URL should also contain the X, Y, width and height of the specific thumbnail in the grid. This is done using the `xywh` parameter in the hash of the URL. See the example below for an example.

```webvtt
WEBVTT

00:00:00.000 --> 00:00:02.000
https://example.com/thumbnails.png#xywh=0,0,100,100

00:00:02.000 --> 00:00:04.000
https://example.com/thumbnails.png#xywh=100,0,100,100

00:00:04.000 --> 00:00:06.000
https://example.com/thumbnails.png#xywh=200,0,100,100

00:00:06.000 --> 00:00:08.000
https://example.com/thumbnails.png#xywh=0,100,100,100

00:00:08.000 --> 00:00:10.000
https://example.com/thumbnails.png#xywh=100,100,100,100

00:00:10.000 --> 00:00:12.000
https://example.com/thumbnails.png#xywh=200,100,100,100
```

React AV provides components to render the thumbnail at a specific time using the `StoryboardThumbnail` component provided by `@react-av/vtt-controls`.
