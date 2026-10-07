# React AV Sliders

This package contains progress and volume slider components based of Radix UI's slider component for use with React AV.

## Installation

```bash
npm i @react-av/core @radix-ui/react-slider @react-av/sliders
yarn add @react-av/core @radix-ui/react-slider @react-av/sliders
pnpm i @react-av/core @radix-ui/react-slider @react-av/sliders
```

## Usage

See the [documentation](https://react-av.wykerd.dev) for more information.

Arrow keys seek one second or adjust volume by five percentage points.
`keyboardStep` customizes these increments independently of pointer precision.
`step` controls pointer precision, defaulting to `0.001` seconds for seeking and
`0.0001` for volume. Shift+Arrow and Page Up/Down use ten keyboard increments;
Home and End move to the limits. Right-to-left and inverted directions are respected.
