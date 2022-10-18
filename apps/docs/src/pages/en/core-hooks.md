---
title: Core Hooks
description: React Hooks API for the core of React AV.
layout: ../../layouts/MainLayout.astro
---

Unlike other media player libraries, React AV is not event driven. Instead, it is driven by state. This allows for a more declarative API and allows for more complex interactions to be built in a way React developers are familiar with.

Our hooks API is built on top of [Recoil](https://recoiljs.org/). This allows for the state to be shared across multiple components. This is useful for building custom controls or other UI components that need to interact with the player.

## useMediaElement()

If you need direct access to the media element controlled by React AV, you can use the `useMediaElement` hook. 

**Returns:** `HTMLMediaElement | null`

## useMediaAudioOnly()

Check whether the media element is a video or audio element. Returns true if the media element is an audio element.

**Returns:** `boolean`

## useMediaMuted()

Check whether the media element is muted. Returns the state and a setter function.

**Returns:** `[boolean, (muted: boolean) => void]`

## useMediaReadyState()

Get the ready state of the media element. This is the same as `HTMLMediaElement#readyState` except that it is reactive. Returns a read only state.

**Returns:** `MediaReadyState`

## useMediaNetworkState()

Get the network state of the media element. This is the same as `HTMLMediaElement#networkState` except that it is reactive. Returns a read only state.

**Returns:** `MediaNetworkState`

## useMediaError()

Get the error state of the media element. This is the same as `HTMLMediaElement#error` except that it is reactive. Returns a read only state.

**Returns:** `MediaError | null`

## useMediaEnded() 

Get the ended state of the media element. This is the same as `HTMLMediaElement#ended` except that it is reactive. Returns a read only state.

**Returns:** `boolean`

## useMediaBuffered()

Get the buffered time ranges of the media element. This is the same as `HTMLMediaElement#buffered` except that it is reactive. Returns a read only state.

**Returns:** `TimeRanges | null`

## useMediaSeeking() 

Get the seeking state of the media element. This is the same as `HTMLMediaElement#seeking` except that it is reactive. Returns a read only state.

**Returns:** `boolean`

## useMediaSeekable()

Get the seekable time ranges of the media element. This is the same as `HTMLMediaElement#seekable` except that it is reactive. Returns a read only state.

**Returns:** `TimeRanges | null`

## useMediaPlaying()

Control whether the media element is playing. Returns the state and a setter function.

**Returns:** `[boolean, (playing: boolean) => void]`

## useMediaLoop()

Control whether the media element is looping. Returns the state and a setter function.

**Returns:** `[boolean, (loop: boolean) => void]`

## useMediaVolume()

Control the volume of the media element. Returns the state and a setter function.

**Returns:** `[number, (volume: number) => void]`

## useMediaPlaybackRate()

Control the playback rate of the media element. Returns the state and a setter function.

**Returns:** `[number, (playbackRate: number) => void]`

## useMediaDuration()

Get the duration of the media element. This is the same as `HTMLMediaElement#duration` except that it is reactive. Returns a read only state.

**Returns:** `number`

## useMediaCurrentTime()

Control the current time of the media element. Returns the state and a setter function.

**Returns:** `[number, (currentTime: number) => void]`

## useMediaCurrentTimeFine()

Get the current time of the media element at a higher refresh rate. This uses `window.requestAnimationFrame` and should be used sparingly to prevent performance issues. Returns the state and a setter function.

**Returns:** `[number, (currentTime: number) => void]`

## useMediaFullscreen()

Control whether the media element is fullscreen. Returns the state and a setter function.

**Returns:** `[boolean, (fullscreen: boolean) => void]`

## useViewportHover() 

Check whether the viewport is hovered or inactive. Returns a read only state.

If used outside of a viewport component, this will return `undefined`.

**Returns:** `boolean | undefined`

## useMediaOpaque(key)

If you need to store additional state for your media element, you can use the `useMediaOpaque<T>(key: string)` hook. The key is scoped to the media element. It is recommended to namespace the key to avoid collisions.

This hook is useful for component libraries using React AV. For example, our HLS module uses this hook to store the HLS instance and allow other components to access it via the `useMediaHLS()` hook.

**Returns:** `[T, (value: T) => void]`
