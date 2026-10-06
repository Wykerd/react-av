# React AV

## Quality
- Treat performance and usability as acceptance requirements. Verify both for behaviour changes; builds and type checks alone are not enough.
- Prioritise real-browser E2E tests of user workflows. Check audio/video playback, keyboard/touch controls, and accessibility where affected.
- Compare performance against the base revision. Measure renders, subscriptions, listener cleanup, and responsiveness under realistic loads.
- Exercise delayed mounting, React Strict Mode, shared controls, and independent players where relevant. Preserve user-selected state.
- Keep hooks cheap: avoid unnecessary renders, persistent listeners, polling, and extra work for existing callers.
- Report measured results and remaining gaps. Never claim no performance issues from source inspection alone.

## Delivery
- Push feature branches directly to `Wykerd/react-av`. Use forks only when explicitly requested.
- Keep PRs focused and small; document public API changes and add a changeset.
- Include matched before/after recordings for interaction changes. Never commit evidence files.
- GitHub Actions is for releases/deployment only; run development checks locally.
- Get explicit approval before publishing or deploying unless already authorized.
