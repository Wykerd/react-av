import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderPlayer } from "./player";

test("pressing Play before the media is ready starts playback once it loads", async () => {
    const video = await renderPlayer({ preload: "none" });
    expect(video.readyState).toBe(HTMLMediaElement.HAVE_NOTHING);

    await userEvent.click(page.getByRole("button", { name: "Play" }));

    const pause = page.getByRole("button", { name: "Pause" });
    await expect.element(pause).toHaveAttribute("data-media-play-state", "playing");
    await expect.poll(() => video.currentTime).toBeGreaterThan(0);
});
