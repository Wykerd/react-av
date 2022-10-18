---
title: Sliders
description: React Components for building basic media player sliders.
layout: ../../layouts/MainLayout.astro
---

Currently, our sliders are seperate from `@react-av/controls` and are based on the headless components from `@radix-ui/react-slider`. This might change in the future. <!-- TODO: update this before v1 -->

```bash
npm i @react-av/core @radix-ui/react-slider @react-av/sliders
```

## ProgressBarRoot

Displays a progress bar for the media. Changing the value of the progress bar will seek the media to the new time.

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

## VolumeSliderRoot

Displays a volume slider for the media. Changing the value of the volume slider will change the volume of the media.

Simply replace Radix UI's `Slider.Root` component with `VolumeSliderRoot` and you're good to go.

```tsx
import * as Media from '@react-av/core';
import * as Slider from '@radix-ui/react-slider';
import { VolumeSliderRoot } from '@react-av/sliders';

function VolumeSlider() {
  return (
    <VolumeSliderRoot>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb />
    </VolumeSliderRoot>
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
