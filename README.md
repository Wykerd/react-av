# React Media

Build modern media players in React.

Fully-featured headless, hooks-based media player framework for React.

# API

## Core

### Media.Root (DONE)

This is the root context for shared state between your media player components.

```tsx
import * as Media from "@react-media/core";

function Player() {
    return <Media.Root>
        ...
    </Media.Root>
}
```

### Media.Video (DONE)

For video players, you need to add a Video component to contain your video feed.

```tsx
import * as Media from "@react-media/core";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
    </Media.Root>
}
```

### Media.Audio

For audio players, you need to add an Audio component to contain your audio feed.

```tsx
import * as Media from "@react-media/core";

function Player() {
    return <Media.Root>
        <Media.Audio src="./audio.mp3" />
    </Media.Root>
}
```

### Media.Viewport (DONE)

The viewport component allows you to render components on top of the video feed, such as controls. When using the viewport for controls, you should set the controls prop to true, which will allow captions to render correctly and not collide with your controls.

```tsx
import * as Media from "@react-media/core";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            ...
        </Media.Viewport>
    </Media.Root>
}
```

## Subtitles, Captions and Metadata

### VTT.Track (DONE)

Add a WebVTT track to your player.

We support the full WebVTT spec, including styling and positioning.

We also support using VTT files for metadata, such as the chapter list and storyboards.

```tsx
import * as Media from "@react-media/core";
import * as VTT from "@react-media/vtt";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <VTT.Track 
            kind="subtitles" 
            label="English" 
            language="en" 
            src="./subtitles.vtt" 
            id="default" 
        />
    </Media.Root>
}
```

### VTT.Cue (DONE)

Render a WebVTT cue.

```tsx
import * as Media from "@react-media/core";
import * as VTT from "@react-media/vtt";

...


const cue: VTT.VTTCue = new VTT.VTTCue(0, 10, "Hello, <b>React Media</b>");

...

<VTT.Cue as="span" cue={cue} />
```

### useMediaTrack(id: string) (DONE)

Consume a text track by ID. Updates the active cues list in real-time as the media progresses.

Returns: `[activeCues, cues]: [VTTCue[], VTTCue[]]` 

```tsx
import * as Media from "@react-media/core";
import * as VTT from "@react-media/vtt";

function Script() {
    const [activeCues, cues] = VTT.useMediaTrack("default");

    return <ol>
        {cues.map((cue, index) => (
            <VTT.Cue 
                as="li" 
                cue={cue}
                key={index}
                className={activeCues.includes(cue) ? "active" : ""}
            />
        )}
    </ol>
}

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <VTT.Track 
            kind="subtitles" 
            label="English" 
            language="en" 
            src="./subtitles.vtt" 
            id="default" 
        />
        <Script />
    </Media.Root>
}
```


## Controls

We provide a set of controls for you to use in your player, however you can also build your own using the hooks provided by the core library.

### Controls.PlayPause (DONE)

Primative play-pause button.

```tsx
import * as Media from "@react-media/core";
import * as Controls from "@react-media/controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            <Controls.PlayPause />
        </Media.Viewport>
    </Media.Root>
}
```

### Controls.PictureInPicture (DONE)

Toggle button for Picture-in-Picture mode.

```tsx
import * as Media from "@react-media/core";
import * as Controls from "@react-media/controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            <Controls.PictureInPicture />
        </Media.Viewport>
    </Media.Root>
}
```

### Controls.Mute

Toggle button for muting the audio.

```tsx
import * as Media from "@react-media/core";
import * as Controls from "@react-media/controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            <Controls.Mute />
        </Media.Viewport>
    </Media.Root>
}
```

### Controls.Loop

Toggle button for looping the media.

```tsx
import * as Media from "@react-media/core";
import * as Controls from "@react-media/controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            <Controls.Loop />
        </Media.Viewport>
    </Media.Root>
}
```

### Controls.Fullscreen

Toggle button for fullscreen mode. Brings the whole viewport into fullscreen mode.

```tsx
import * as Media from "@react-media/core";
import * as Controls from "@react-media/controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            <Controls.Fullscreen />
        </Media.Viewport>
    </Media.Root>
}
```

### Controls.Timestamp

Displays a timestamp for the media. Pick between elapsed time, remaining time or media duration (defaults to elapsed time).

```tsx
import * as Media from "@react-media/core";
import * as Controls from "@react-media/controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            <Controls.Timestamp format="remaining" />
        </Media.Viewport>
    </Media.Root>
}
```

## Sliders

Our sliders are based on the Radix UI Slider Primitive. We just do the integration with the core library for you.

### Sliders.VolumeRoot

Volume slider. Simply replace Slider.Root with our own VolumeSliderRoot component.


### Sliders.ProgressBarRoot

Displays a progress bar for the media. Clicking on the bar will seek to the clicked position. 

We have a more advanced progress bar component for users using our VTT module, which displays the chapter list and storyboards when you hover over the bar.

```tsx
import * as Media from "@react-media/core";
import * as Controls from "@react-media/controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <Media.Viewport controls>
            <Controls.ProgressBar />
        </Media.Viewport>
    </Media.Root>
}
```

### Sliders.ProgressBarBufferedRegions

TODO.

## VTT Controls

An extended set of prebuilt controls for users of the VTT module.

### VTTControls.StoryboardThumbnail

Displays a storyboard thumbnail for a given timestamp.

```tsx
import * as Media from "@react-media/core";
import * as VTT from "@react-media/vtt";
import * as VTTControls from "@react-media/vtt-controls";

function Player() {
    return <Media.Root>
        <Media.Video src="./video.mp4" />
        <VTT.Track 
            kind="metadata" 
            label="English" 
            language="en" 
            src="./storyboard.vtt" 
            id="storyboard" 
        />
        <Media.Viewport controls>
            <VTTControls.StoryboardThumbnail storyboardId="storyboard" timestamp={30} />
        </Media.Viewport>
    </Media.Root>
}
```
