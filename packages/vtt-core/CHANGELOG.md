# @react-av/vtt-core

## 0.0.9

### Patch Changes

- 0478387: Parse multiline region settings and numeric cue line positions correctly, while ignoring malformed and non-finite line values.
- 63ef314: Security hardening: `toVTT` no longer lets cue text inject extra cues, `StoryboardThumbnail` validates storyboard URLs and regions instead of crashing, WebVTT cue text now decodes HTML character references, caption layout no longer loops forever when a cue cannot be placed, and published packages only include build output and sources.
- 3a63648: Reveal video controls on touch and let taps pass through the caption overlay.
- 0de08e4: Upgrade dependencies, support React 19 and Shaka Player 5 alongside React 18 and Shaka Player 4.

## 0.0.8

### Patch Changes

- 86fb2c9: Removed rollup bundling. Library users should use their own bundler.

## 0.0.7

### Patch Changes

- Minor fixes for AABB and hooks of VTT

## 0.0.6

### Patch Changes

- General refactor of VTT libraries. Brings our implementation more inline with the standard HTML implementations.

## 0.0.5

### Patch Changes

- Refactor VTT core global state

## 0.0.4

### Patch Changes

- Add resize observer to recompute text track cue positions when video container size changes

## 0.0.3

### Patch Changes

- Fix text track container alignment.

## 0.0.2

### Patch Changes

- Fix WebVTT renderer reset behaviour

## 0.0.1

### Patch Changes

- e36e0fb: Initial experimental release
