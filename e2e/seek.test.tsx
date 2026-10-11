import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderPlayer } from "./player";

test("seeking with the progress slider moves the current time and the timestamp", async () => {
    const video = await renderPlayer();
    const seek = page.getByRole("slider", { name: "Seek" });
    await expect.element(seek).toHaveAttribute("aria-valuemax", "4");

    await userEvent.click(seek);
    await userEvent.keyboard("{End}");
    await expect.element(page.getByText("00:04")).toBeVisible();
    expect(video.currentTime).toBe(4);
    await expect.poll(() => video.seeking).toBe(false);

    await userEvent.keyboard("{Home}");
    await expect.element(page.getByText("00:00")).toBeVisible();
    expect(video.currentTime).toBe(0);
});
