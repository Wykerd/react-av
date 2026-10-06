---
title: React Subtitles and WebVTT Captions
description: Add WebVTT subtitles, styled captions, chapter data, and storyboard previews to React video players with React AV text tracks.
layout: ../../layouts/MainLayout.astro
---

React AV features a fully-featured <!-- TODO: and spec compliant --> [W3C WebVTT](https://www.w3.org/TR/webvtt1/) parser and renderer. This not only allows for the rendering of captions and subtitles, but also for the rendering of chapters and metadata such as storyboards.

## Installation

WebVTT support is included in the `@react-av/vtt` package. This package is dependant on both `@react-av/core` and `@react-av/vtt-core` packages.

You can install it using your package manager of choice:

```bash
npm i @react-av/vtt-core @react-av/vtt
```

For more info on the `@react-av/vtt-core` package, see the [Text Track Implementation](/en/webvtt/) page of the docs.

## WebVTT Subtitles

Create a UTF-8 file named `captions.vtt` in your application's public directory:

```text
WEBVTT

00:00:00.000 --> 00:00:04.000
Welcome to the lesson.

00:00:04.000 --> 00:00:08.000
These captions follow the video's playback position.
```

Serve the file from the same origin as the player, or configure the caption server to allow cross-origin requests. The following example expects `/captions.vtt` and your own `/video.mp4`.

React AV implements the WebVTT rendering algorithm as defined in the [W3C WebVTT specification](https://www.w3.org/TR/webvtt1/). This means that you can use any WebVTT file to render subtitles and captions. Your captions should render the same way on all browsers and devices.

To use WebVTT subtitles, you should not use the native browser `<track>` element. Instead, you should use our `Track` component provided by `@react-av/vtt`. This component accepts a `src` prop which should be a URL to your WebVTT file.

For captions managed by React AV, provide an explicit WebVTT file to `Track` alongside your media component.

```jsx
import * as Media from '@react-av/core';
import { Track } from '@react-av/vtt';

() => (
  <Media.Root>
    <Media.Container>
      <Media.Video src="/video.mp4" controls playsInline />
    </Media.Container>
    <Track src="/captions.vtt" kind="subtitles" srclang="en" label="English" default />
  </Media.Root>
);
```

The `Track` component accepts a `kind` prop which can be used to specify the type of track. The default value is `subtitles`. The following values are supported: `"subtitles" | "captions" | "descriptions" | "chapters" | "metadata"`.

<!-- TODO: more detailed props explaination -->

Provide a `label` prop for the track's human-readable name and `srclang` for its language. Use `default` to show the track when it loads.

If you wish to programmatically access the text track, provide it a `id` prop. This will allow you to access the track using the `useMediaTextTrack(id)` hook.

## WebVTT Styling

WebVTT supports styling of captions and subtitles using CSS. This allows you to customize the look and feel of your captions and subtitles.

Our implementation does not currently support WebVTT style blocks.

## WebVTT Chapters

WebVTT also supports the rendering of chapters. This allows you to provide a list of chapters for your video. This can be useful for users to skip to a specific part of the video.

<!-- TODO: once our chapter support is done, include more docs here -->

Our underlying implementation in `@react-av/vtt-core` supports chapters. Render your own chapter list using the [text track hooks](/en/text-track-hooks/); a prebuilt chapter-list component is not included.

## WebVTT Storyboards

WebVTT allows for timed metadata to be included. This can be used to provide storyboards for your video. Storyboards are a grid of images taken at regular intervals throughout the video. This is usally used for seek previews while scrubbing or hovering over the progress bar.

Your WebVTT file should consist of a series of cues each containing a URL to a resource. The resource should be an image. The URL should also contain the X, Y, width and height of the specific thumbnail in the grid. This is done using the `xywh` parameter in the hash of the URL. See the example below for an example.

```text
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

To let users edit caption text and timing, follow the [React subtitle editor guide](/en/subtitle-editor/). For lower-level parsing and rendering, see the [WebVTT API](/en/webvtt/).
