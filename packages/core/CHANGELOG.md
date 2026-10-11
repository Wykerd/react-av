# @react-av/core

## 0.1.0

### Minor Changes

- 48e4273: Accept an optional initial rate in `useMediaPlaybackRate`, applied once the media element becomes available without resetting later speed changes.
- 9638a69: Add lazy media loading to Media.Root, activated near the viewport or on interaction, with a loading-state hook and container attribute.

### Patch Changes

- 83d2286: `useMediaDuration` returns `0` instead of `NaN` until the media's duration is known, so timestamps no longer render `NaN:NaN` while loading.
- 88a11fc: Remove fullscreen event listeners when the last fullscreen control unmounts, and avoid attaching them for unused stores.
- 284f9a7: Keep the player mounted when playback starts by stabilizing current-time snapshots.
- b38573a: Open native video fullscreen on iPhone and keep the fullscreen button in sync after exiting.
- 2280722: Stop polling playback time while paused or ended, while keeping paused seeking and smooth playback updates.
- 63ef314: Security hardening: `toVTT` no longer lets cue text inject extra cues, `StoryboardThumbnail` validates storyboard URLs and regions instead of crashing, WebVTT cue text now decodes HTML character references, caption layout no longer loops forever when a cue cannot be placed, and published packages only include build output and sources.
- 4659bc0: Support server-rendered players and controls with stable initial snapshots during hydration, and synchronize controls when already-loaded media is registered or removed.
- 5b83f9a: Keep play and pause controls in sync when playback starts or stops through browser controls or the media element.
- 3a63648: Reveal video controls on touch and let taps pass through the caption overlay.
- 0de08e4: Upgrade dependencies, support React 19 and Shaka Player 5 alongside React 18 and Shaka Player 4.

## 0.0.5

### Patch Changes

- 2b4fe98: Removed recoil. Implemented own internal state management.
- 86fb2c9: Removed rollup bundling. Library users should use their own bundler.

## 0.0.4

### Patch Changes

- Updated dependencies
  - @react-av/vtt-core@0.0.4

## 0.0.3

### Patch Changes

- Updated dependencies
  - @react-av/vtt-core@0.0.3

## 0.0.2

### Patch Changes

- Fix WebVTT renderer reset behaviour
- Updated dependencies
  - @react-av/vtt-core@0.0.2

## 0.0.1

### Patch Changes

- e36e0fb: Initial experimental release
- Updated dependencies [e36e0fb]
  - @react-av/vtt-core@0.0.1
