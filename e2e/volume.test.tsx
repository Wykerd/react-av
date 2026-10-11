import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderPlayer } from "./player";

test("the volume slider sets the volume", async () => {
    const video = await renderPlayer();
    const volume = page.getByRole("slider", { name: "Volume" });

    await userEvent.click(volume);
    await userEvent.keyboard("{Home}");
    await expect.element(volume).toHaveAttribute("aria-valuenow", "0");
    expect(video.volume).toBe(0);

    await userEvent.keyboard("{End}");
    await expect.element(volume).toHaveAttribute("aria-valuenow", "1");
    expect(video.volume).toBe(1);
});

test("the Mute button mutes and unmutes the video", async () => {
    const video = await renderPlayer();

    await userEvent.click(page.getByRole("button", { name: "Mute" }));
    await expect.element(page.getByRole("button", { name: "Unmute" })).toBeVisible();
    expect(video.muted).toBe(true);

    await userEvent.click(page.getByRole("button", { name: "Unmute" }));
    await expect.element(page.getByRole("button", { name: "Mute" })).toBeVisible();
    expect(video.muted).toBe(false);
});
