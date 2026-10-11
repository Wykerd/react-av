# @react-av/shaka

## 0.0.7

### Patch Changes

- 63ef314: Security hardening: `toVTT` no longer lets cue text inject extra cues, `StoryboardThumbnail` validates storyboard URLs and regions instead of crashing, WebVTT cue text now decodes HTML character references, caption layout no longer loops forever when a cue cannot be placed, and published packages only include build output and sources.
- 412b9c2: The player is created with the media element again instead of calling `attach()`, so Shaka's "initializing Player with a mediaElement" deprecation warning returns. The 0.0.6 fix for it was published from changes that never reached the repository, so this release does not include it.
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

## 0.0.6

### Patch Changes

- Clear up deprecation warnings

## 0.0.5

### Patch Changes

- 2b4fe98: Initial support for shaka-player. This package replaces @react-av/hls.
- Updated dependencies [2b4fe98]
- Updated dependencies [86fb2c9]
  - @react-av/core@0.0.5
