import { SkipBack, SkipForward, Timestamp } from "@react-av/controls";
import * as Media from "@react-av/core";
import { StrictMode } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";

async function renderSkipPlayer(videoProps: Media.VideoProps = {}) {
    const screen = await render(
        <StrictMode>
            <Media.Root>
                <Media.Container>
                    <Media.Video src={clip} {...videoProps} />
                </Media.Container>
                <Media.Viewport>
                    <SkipBack seconds={3} />
                    <SkipForward seconds={3} />
                    <Timestamp type="elapsed" />
                </Media.Viewport>
            </Media.Root>
        </StrictMode>,
    );
    return screen.container.querySelector("video")!;
}

test("the skip buttons move by their step and stop at the start and end", async () => {
    const video = await renderSkipPlayer();
    await expect.poll(() => video.duration).toBe(4);
    const back = page.getByRole("button", { name: "Back 3 seconds" });
    const forward = page.getByRole("button", { name: "Forward 3 seconds" });

    await userEvent.click(forward);
    await expect.element(page.getByText("00:03")).toBeVisible();
    expect(video.currentTime).toBe(3);

    await userEvent.click(forward);
    await expect.element(page.getByText("00:04")).toBeVisible();
    expect(video.currentTime).toBe(4);
    await expect.poll(() => video.seeking).toBe(false);

    await userEvent.click(back);
    await expect.element(page.getByText("00:01")).toBeVisible();
    expect(video.currentTime).toBe(1);

    await userEvent.click(back);
    await expect.element(page.getByText("00:00")).toBeVisible();
    expect(video.currentTime).toBe(0);
});

test("the skip buttons do nothing before the media has loaded", async () => {
    const video = await renderSkipPlayer({ preload: "none" });

    await userEvent.click(page.getByRole("button", { name: "Forward 3 seconds" }));
    expect(video.currentTime).toBe(0);
    expect(video.readyState).toBe(HTMLMediaElement.HAVE_NOTHING);
});
