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

The default `step` is one second. Arrow keys move one step; Shift+Arrow and Page Up/Down move ten steps. Pass `step={0.001}` when you need millisecond precision for pointer and keyboard adjustments.

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

The default `step` is `0.05`, or five percentage points. Pass `step={0.01}` for one-percentage-point pointer and keyboard adjustments. Home and End move either slider to its minimum or maximum.

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
