# React AV Core

This package contains the core components of React AV.

## Installation

```bash
npm i @react-av/core
yarn add @react-av/core
pnpm i @react-av/core
```

## Usage

See the [documentation](https://react-av.wykerd.dev) for more information.

### Server rendering

`Media.Root` and its controls can render on the server. Media hooks use the
player's initial state during server rendering and hydration, then read the
browser's media state after hydration. Each root has its own store.

`StateStore` accepts an optional `getServerSnapshot` for custom stores used with
`useStateStoreValue` or `useStateStore`. Return the same initial value on the
server and during client hydration. Without it, these hooks use `getState`.
