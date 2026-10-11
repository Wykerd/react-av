import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderPlayer } from "./player";

test("the speed button steps through the speeds and wraps around to the slowest", async () => {
    const video = await renderPlayer();
    const speed = page.getByRole("button", { name: /^Playback speed/ });
    await expect.element(speed).toHaveAccessibleName("Playback speed 1×");
    await expect.element(speed).toHaveTextContent("1×");

    for (const rate of [1.25, 1.5, 2, 0.5]) {
        await userEvent.click(speed);
        await expect.element(speed).toHaveAccessibleName(`Playback speed ${rate}×`);
        await expect.element(speed).toHaveTextContent(`${rate}×`);
        expect(video.playbackRate).toBe(rate);
    }
});

test("after the speed changes elsewhere, the speed button moves on to the next faster speed", async () => {
    const video = await renderPlayer();
    const speed = page.getByRole("button", { name: /^Playback speed/ });

    video.playbackRate = 1.1;
    await expect.element(speed).toHaveAccessibleName("Playback speed 1.1×");

    await userEvent.click(speed);
    await expect.element(speed).toHaveAccessibleName("Playback speed 1.25×");
    expect(video.playbackRate).toBe(1.25);
});
