import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderPlayer } from "./player";

test("the fullscreen button enters and exits fullscreen", async () => {
    const video = await renderPlayer();

    await userEvent.click(page.getByRole("button", { name: "Enter Fullscreen" }));
    await expect.element(page.getByRole("button", { name: "Exit Fullscreen" })).toBeVisible();
    expect(document.fullscreenElement).toBe(video.parentElement);

    await userEvent.click(page.getByRole("button", { name: "Exit Fullscreen" }));
    await expect.element(page.getByRole("button", { name: "Enter Fullscreen" })).toBeVisible();
    expect(document.fullscreenElement).toBeNull();
});
