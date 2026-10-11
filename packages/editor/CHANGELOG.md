# @react-av/editor

## 0.0.3

### Patch Changes

- 16cad75: Give the timeline zoom buttons accessible names and tooltips. Keep zoom and subtitle editing actions from submitting a surrounding form.
- 412b9c2: Default icons come from Phosphor again, and `@phosphor-icons/react` is a dependency again. The outline icons in controls 0.0.7 and editor 0.0.2 were published from changes that never reached the repository, so this release does not include them.
- 63ef314: Security hardening: `toVTT` no longer lets cue text inject extra cues, `StoryboardThumbnail` validates storyboard URLs and regions instead of crashing, WebVTT cue text now decodes HTML character references, caption layout no longer loops forever when a cue cannot be placed, and published packages only include build output and sources.
- 33b241d: Avoid recalculating subtitle overlaps as playback advances when no timeline edit is in progress.
- 67d006f: Keep timeline scrubbing active when the pointer leaves the editor, until the gesture ends.
- 0de08e4: Upgrade dependencies, support React 19 and Shaka Player 5 alongside React 18 and Shaka Player 4.
- Updated dependencies [83d2286]
- Updated dependencies [0478387]
- Updated dependencies [88a11fc]
- Updated dependencies [48e4273]
- Updated dependencies [284f9a7]
- Updated dependencies [8523530]
- Updated dependencies [9638a69]
- Updated dependencies [b38573a]
- Updated dependencies [2280722]
- Updated dependencies [edb2223]
- Updated dependencies [412b9c2]
- Updated dependencies [63ef314]
- Updated dependencies [4659bc0]
- Updated dependencies [5b83f9a]
- Updated dependencies [3a63648]
- Updated dependencies [0de08e4]
  - @react-av/core@0.1.0
  - @react-av/vtt-core@0.0.9
  - @react-av/controls@0.0.8
  - @react-av/vtt@0.0.11

## 0.0.2

### Patch Changes

- Remove external icon library dependency
- Updated dependencies
  - @react-av/controls@0.0.7

## 0.0.1

### Patch Changes

- 124525d: Initial release for React AV editor components
- Updated dependencies [2b4fe98]
- Updated dependencies [86fb2c9]
  - @react-av/core@0.0.5
  - @react-av/controls@0.0.6
  - @react-av/vtt@0.0.10
  - @react-av/vtt-core@0.0.8
