---
title: Build a React Subtitle Editor
description: Build a React subtitle timeline with editable WebVTT cues, drag-to-adjust timing, video playback, and WebVTT export using React AV.
layout: ../../layouts/MainLayout.astro
---

Use `@react-av/editor` to add a subtitle timeline to a video application. Users can select captions, edit their text, adjust their timing, and create new cues. The editor shares playback state with React AV's media components.

[Try the subtitle editor demo](/#editor) to see the same components with different styles.

## Install the packages

In an existing React application, install the editor and its React AV peer dependencies:

```bash
npm i @react-av/core @react-av/controls @react-av/vtt @react-av/vtt-core @react-av/editor
```

Render the editor in the browser. For Astro, use `client:only="react"`; for a server-rendered React framework, load the editor with server rendering disabled.

## Connect a video and caption file

Put your video at `/lesson.mp4` and a WebVTT file at `/captions.vtt`. A minimal caption file looks like this:

```text
WEBVTT

00:00:00.000 --> 00:00:04.000
Welcome to the lesson.

00:00:04.000 --> 00:00:08.000
Select a caption to edit its text.
```

Use the same track ID for `Track` and `TimelineSubtitlesTrack`. The editor creates the media container; keep it and the caption track inside one `Media.Root`.

```tsx
import { useState } from 'react';
import * as Media from '@react-av/core';
import { Track } from '@react-av/vtt';
import {
  Editor, TimelineEditor, TimelineControlBar, TimelineContainer,
  TimelineHeader, TimelineSubtitlesTrack, TimelineSubtitleCueEditor, toVTT,
} from '@react-av/editor';

export function SubtitleEditor() {
  const [subtitles, setSubtitles] = useState('');

  return (
    <Media.Root>
      <Track id="captions" kind="subtitles" srclang="en"
        label="English" src="/captions.vtt" default />
      <Editor mediaComponent={<Media.Video src="/lesson.mp4" controls playsInline />}>
        <TimelineEditor>
          <TimelineControlBar />
          <TimelineContainer>
            <TimelineHeader />
            <TimelineSubtitlesTrack id="captions"
              onTrackCuesChanged={track => setSubtitles(toVTT(track))}>
              <TimelineSubtitleCueEditor />
            </TimelineSubtitlesTrack>
          </TimelineContainer>
        </TimelineEditor>
      </Editor>
      <label>
        WebVTT output
        <textarea value={subtitles} readOnly />
      </label>
    </Media.Root>
  );
}
```

## Edit and save subtitles

Select a cue to open its text field. Drag a cue to move it, drag its edge to resize it, or drag an empty part of the timeline to create a new cue. The cue editor also provides a delete action.

`onTrackCuesChanged` receives the updated text track when its cues change. The example turns it into WebVTT with `toVTT` and shows the result in a read-only field. Save that string to a `.vtt` file or send it to your application's backend. Changes stay in browser memory until your application saves them.

## Styling and limits

The components are headless. Use their `styling` props to supply classes or inline styles; the [demo source](https://github.com/Wykerd/react-av/blob/master/apps/docs/src/demos/EditorDemo.tsx) shows complete examples.

This edits subtitle text and timing. It does not transcribe speech, encode video, burn captions into the video, or provide storage. `toVTT` exports cue text and times; it does not preserve cue positioning, regions, or style blocks. Serve cross-origin caption files with the appropriate CORS headers.

For caption playback without editing, see [React subtitles and WebVTT captions](/en/text-track-introduction/). For adaptive streams, see the [React HLS and DASH player guide](/en/core-other-sources/).
