# @react-av/vtt

## 0.0.11

### Patch Changes

- 63ef314: Security hardening: `toVTT` no longer lets cue text inject extra cues, `StoryboardThumbnail` validates storyboard URLs and regions instead of crashing, WebVTT cue text now decodes HTML character references, caption layout no longer loops forever when a cue cannot be placed, and published packages only include build output and sources.
- 0de08e4: Upgrade dependencies, support React 19 and Shaka Player 5 alongside React 18 and Shaka Player 4.
- Updated dependencies [83d2286]
- Updated dependencies [0478387]
- Updated dependencies [88a11fc]
- Updated dependencies [48e4273]
- Updated dependencies [284f9a7]
- Updated dependencies [9638a69]
- Updated dependencies [b38573a]
- Updated dependencies [2280722]
- Updated dependencies [63ef314]
- Updated dependencies [4659bc0]
- Updated dependencies [5b83f9a]
- Updated dependencies [3a63648]
- Updated dependencies [0de08e4]
  - @react-av/core@0.1.0
  - @react-av/vtt-core@0.0.9

## 0.0.10

### Patch Changes

- 86fb2c9: Removed rollup bundling. Library users should use their own bundler.
- Updated dependencies [2b4fe98]
- Updated dependencies [86fb2c9]
  - @react-av/core@0.0.5
  - @react-av/vtt-core@0.0.8

## 0.0.9

### Patch Changes

- Minor bug fixes

## 0.0.8

### Patch Changes

- Minor fixes for AABB and hooks of VTT
- Updated dependencies
  - @react-av/vtt-core@0.0.7

## 0.0.7

### Patch Changes

- General refactor of VTT libraries. Brings our implementation more inline with the standard HTML implementations.
- Updated dependencies
  - @react-av/vtt-core@0.0.6

## 0.0.6

### Patch Changes

- Refactor VTT core global state
- Updated dependencies
  - @react-av/vtt-core@0.0.5

## 0.0.5

### Patch Changes

- Add useMediaTextTrackList hook for consuming list of all text tracks of the media element

## 0.0.4

### Patch Changes

- Add resize observer to recompute text track cue positions when video container size changes
- Updated dependencies
  - @react-av/vtt-core@0.0.4
  - @react-av/core@0.0.4

## 0.0.3

### Patch Changes

- Updated dependencies
  - @react-av/vtt-core@0.0.3
  - @react-av/core@0.0.3

## 0.0.2

### Patch Changes

- Fix WebVTT renderer reset behaviour
- Updated dependencies
  - @react-av/core@0.0.2
  - @react-av/vtt-core@0.0.2

## 0.0.1

### Patch Changes

- e36e0fb: Initial experimental release
- Updated dependencies [e36e0fb]
  - @react-av/core@0.0.1
  - @react-av/vtt-core@0.0.1
