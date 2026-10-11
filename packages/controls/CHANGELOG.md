# @react-av/controls

## 0.0.8

### Patch Changes

- 8523530: Keep Play usable before media data loads and show buffering only after playback is requested.
- edb2223: Preserve custom children in PictureInPicture so composed buttons can render their icons, while retaining the icon prop and default icon fallback.
- 412b9c2: Default icons come from Phosphor again, and `@phosphor-icons/react` is a dependency again. The outline icons in controls 0.0.7 and editor 0.0.2 were published from changes that never reached the repository, so this release does not include them.
- 63ef314: Security hardening: `toVTT` no longer lets cue text inject extra cues, `StoryboardThumbnail` validates storyboard URLs and regions instead of crashing, WebVTT cue text now decodes HTML character references, caption layout no longer loops forever when a cue cannot be placed, and published packages only include build output and sources.
- 0de08e4: Upgrade dependencies, support React 19 and Shaka Player 5 alongside React 18 and Shaka Player 4.
- Updated dependencies [83d2286]
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

## 0.0.7

### Patch Changes

- Remove external icon library dependency

## 0.0.6

### Patch Changes

- 86fb2c9: Removed rollup bundling. Library users should use their own bundler.
- Updated dependencies [2b4fe98]
- Updated dependencies [86fb2c9]
  - @react-av/core@0.0.5

## 0.0.5

### Patch Changes

- Minor bug fixes

## 0.0.4

### Patch Changes

- @react-av/core@0.0.4

## 0.0.3

### Patch Changes

- @react-av/core@0.0.3

## 0.0.2

### Patch Changes

- Fix WebVTT renderer reset behaviour
- Updated dependencies
  - @react-av/core@0.0.2

## 0.0.1

### Patch Changes

- e36e0fb: Initial experimental release
- Updated dependencies [e36e0fb]
  - @react-av/core@0.0.1
