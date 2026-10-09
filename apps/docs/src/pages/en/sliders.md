---
title: React Seek and Volume Sliders
description: Build seek bars, buffered-range indicators, and volume sliders for React media players with React AV and Radix UI slider primitives.
layout: ../../layouts/MainLayout.astro
---

Currently, our sliders are seperate from `@react-av/controls` and are based on the headless components from `@radix-ui/react-slider`. This might change in the future. <!-- TODO: update this before v1 -->

```bash
npm i @react-av/core @radix-ui/react-slider @react-av/sliders
```

## ProgressBarRoot

Displays a progress bar for the media. Changing the value of the progress bar will seek the media to the new time.

Arrow keys seek one second by default. Set `keyboardStep` to change this increment independently of pointer precision, which defaults to `step={0.001}` seconds. Shift+Arrow and Page Up/Down move ten keyboard increments.

Simply replace Radix UI's `Slider.Root` component with `ProgressBarRoot` and you're good to go.

```tsx
import * as Media from '@react-av/core';
import * as Slider from '@radix-ui/react-slider';
import { ProgressBarRoot } from '@react-av/sliders';

function ProgressBar() {
  return (
    <ProgressBarRoot>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb />
    </ProgressBarRoot>
  )
}
```

## VolumeRoot

Displays a volume slider for the media. Changing the value of the volume slider will change the volume of the media.

Arrow keys change volume by five percentage points by default. Pass `keyboardStep={0.01}` for one-percentage-point keyboard adjustments. Pointer precision defaults to `step={0.0001}`. Home and End move either slider to its minimum or maximum.

Simply replace Radix UI's `Slider.Root` component with `VolumeRoot` and you're good to go.

```tsx
import * as Media from '@react-av/core';
import * as Slider from '@radix-ui/react-slider';
import { VolumeRoot } from '@react-av/sliders';

function VolumeSlider() {
  return (
    <VolumeRoot>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb />
    </VolumeRoot>
  )
}
```

## ProgressBarBufferedRanges

Displays the buffered ranges of the media. This is useful for showing the user how much of the media has been buffered.

Simply add `ProgressBarBufferedRanges` as a child of Radix UI's `Slider.Track` and you're good to go.

```tsx
import * as Media from '@react-av/core';
import * as Slider from '@radix-ui/react-slider';
import { ProgressBarRoot, ProgressBarBufferedRanges } from '@react-av/sliders';

function ProgressBar() {
  return (
    <ProgressBarRoot>
      <Slider.Track>
        <ProgressBarBufferedRanges />
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb />
    </ProgressBarRoot>
  )
}
```
