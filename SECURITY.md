# Security Policy

## Supported versions

Security fixes are released for the latest published version of each `@react-av/*` package.

## Reporting a vulnerability

Please do not open a public issue for security problems. Report them privately through [GitHub's vulnerability reporting](https://github.com/Wykerd/react-av/security/advisories/new) with a description of the issue, the affected package and version, and steps to reproduce.

Once a fix is released, the advisory is published with credit to the reporter unless they prefer to remain anonymous.

## Handling untrusted media

React AV renders WebVTT cue text with DOM APIs (`createElement` and text nodes), never as HTML, so caption content cannot inject markup or scripts. Media, track, and storyboard URLs are fetched as provided, so applications that accept URLs from users should validate them before passing them to React AV.
