---
title: Controls Introduction
description: Introduction to the React AV control components.
layout: ../../layouts/MainLayout.astro
---

Instead of writing a bunch of components, using our hooks API, for common media interactions, we provide a set of prebuilt components that you can use to build your own media player.

All our controls are unstyled and are meant to be used with your own custom styles. This allows you to build a media player that matches your brand.

We do however provide our controls with default icons from the [Phosphor Icons](https://phosphoricons.com/) library. You can use these icons or you can use your own custom icons.

## Packages

Currently we provide three control packages:

- `@react-av/controls` - The core controls package, this includes all the controls you need to build a basic media player.
- `@react-av/sliders` - The sliders package, this includes all the sliders you need to build a media player with volume and seek controls.
- `@react-av/vtt-controls` - The VTT controls package, this includes all the controls you need for chapter navigation and storyboard thumbnails.
