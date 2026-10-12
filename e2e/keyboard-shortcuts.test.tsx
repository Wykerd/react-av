import * as Media from "@react-av/core";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import eightSecondClip from "./fixtures/clip-8s.webm";
import clip from "./fixtures/clip.webm";
import { renderPlayer } from "./player";

test("Space and K play and pause the focused player", async () => {
    const video = await renderPlayer();
    await userEvent.click(video);

    await userEvent.keyboard("{Space}");
    await expect.element(page.getByRole("button", { name: "Pause" })).toBeVisible();

    await userEvent.keyboard("k");
    await expect.element(page.getByRole("button", { name: "Play" })).toBeVisible();
    expect(video.paused).toBe(true);
});

test("the left and right arrows seek five seconds within the media", async () => {
    const video = await renderPlayer({ src: eightSecondClip });
    await expect.element(page.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuemax", "8");
    await userEvent.click(video);

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByText("00:05")).toBeVisible();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByText("00:08")).toBeVisible();
    await expect.poll(() => video.seeking).toBe(false);

    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(page.getByText("00:03")).toBeVisible();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(page.getByText("00:00")).toBeVisible();
});

test("the up and down arrows change the volume by ten percent", async () => {
    const video = await renderPlayer();
    const volume = page.getByRole("slider", { name: "Volume" });
    await userEvent.click(video);

    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => Number(volume.element().getAttribute("aria-valuenow"))).toBeCloseTo(0.9, 6);
    expect(video.volume).toBeCloseTo(0.9, 6);

    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect.element(volume).toHaveAttribute("aria-valuenow", "1");

    await userEvent.keyboard("{ArrowDown>11/}");
    await expect.element(volume).toHaveAttribute("aria-valuenow", "0");
});

test("F toggles fullscreen and M toggles mute", async () => {
    const video = await renderPlayer();
    await userEvent.click(video);

    await userEvent.keyboard("f");
    await expect.element(page.getByRole("button", { name: "Exit Fullscreen" })).toBeVisible();
    await userEvent.keyboard("f");
    await expect.element(page.getByRole("button", { name: "Enter Fullscreen" })).toBeVisible();

    await userEvent.keyboard("m");
    await expect.element(page.getByRole("button", { name: "Unmute" })).toBeVisible();
    await userEvent.keyboard("m");
    await expect.element(page.getByRole("button", { name: "Mute" })).toBeVisible();
});

test("shortcuts only control the focused player", async () => {
    const first = await renderPlayer();
    const second = await renderPlayer();

    await userEvent.click(second);
    await userEvent.keyboard("km");
    await expect.poll(() => second.paused).toBe(false);
    expect(second.muted).toBe(true);
    expect(first.paused).toBe(true);
    expect(first.muted).toBe(false);
});

test("typing in a text field inside the player does not trigger shortcuts", async () => {
    const screen = await render(
        <Media.Root>
            <Media.Container>
                <Media.Video src={clip} />
                <input aria-label="Comment" />
            </Media.Container>
        </Media.Root>,
    );
    const video = screen.container.querySelector("video")!;
    const comment = page.getByRole("textbox", { name: "Comment" });

    await userEvent.click(comment);
    await userEvent.keyboard("k m f{ArrowLeft}{ArrowRight}");
    await expect.element(comment).toHaveValue("k m f");
    expect(video.paused).toBe(true);
    expect(video.muted).toBe(false);
    expect(video.currentTime).toBe(0);
    expect(document.fullscreenElement).toBeNull();
});

test("focused buttons and sliders keep their own keyboard behaviour", async () => {
    const video = await renderPlayer({ src: eightSecondClip });
    await expect.poll(() => video.duration).toBe(8);
    await userEvent.click(page.getByRole("button", { name: "Play" }));
    await userEvent.keyboard("{Space}");
    await expect.poll(() => video.paused).toBe(true);
    const seek = page.getByRole("slider", { name: "Seek" });
    seek.element().focus();
    await userEvent.keyboard("{Home}");
    await expect.poll(() => video.currentTime).toBe(0);
    const previousTime = video.currentTime;
    await userEvent.keyboard("{ArrowRight}");
    expect(video.currentTime).toBeLessThan(previousTime + 5);
    const volume = page.getByRole("slider", { name: "Volume" });
    volume.element().focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(video.volume).toBeGreaterThan(0.9);
    expect(video.volume).toBeLessThan(1);
});

test("modified keys and the opt-out leave the player's state alone", async () => {
    const video = await renderPlayer();
    await userEvent.click(video);
    await userEvent.keyboard("{Control>}k{/Control}{Meta>}m{/Meta}{Alt>}f{/Alt}");
    expect(video.paused).toBe(true);
    expect(video.muted).toBe(false);
    const screen = await render(<Media.Root><Media.Container keyboardShortcuts={false} tabIndex={0}>
        <Media.Video src={clip} />
    </Media.Container></Media.Root>);
    const disabledVideo = screen.container.querySelector("video")!;
    await userEvent.click(disabledVideo);
    await userEvent.keyboard("km{ArrowRight}f");
    expect(disabledVideo.paused).toBe(true);
    expect(disabledVideo.muted).toBe(false);
    expect(disabledVideo.currentTime).toBe(0);
    expect(document.fullscreenElement).toBeNull();
});

test("apps can reserve player keys in child and container handlers", async () => {
    const handledKeys: string[] = [];
    const screen = await render(<Media.Root><Media.Container onKeyDown={event => {
        handledKeys.push(event.key);
        if (event.key === "m") event.preventDefault();
    }}>
        <Media.Video src={clip} />
        <button onKeyDown={event => {
            if (event.key === "k") event.preventDefault();
        }}>Custom shortcuts</button>
    </Media.Container></Media.Root>);
    const video = screen.container.querySelector("video")!;
    await userEvent.click(page.getByRole("button", { name: "Custom shortcuts" }));
    page.getByRole("button", { name: "Custom shortcuts" }).element().focus();
    await userEvent.keyboard("km");
    expect(video.paused).toBe(true);
    expect(video.muted).toBe(false);
    expect(handledKeys).toEqual(["k", "m"]);
});


test("portalled controls keep shortcuts and respect child handlers and opt-out", async () => {
    for (const enabled of [true, false]) {
        const screen = await render(<Media.Root>
            <Media.Container keyboardShortcuts={enabled}><Media.Video src={clip} /></Media.Container>
            <Media.Viewport>
                <button>Toolbar</button>
                <button onKeyDown={event => event.preventDefault()}>Reserved key</button>
            </Media.Viewport>
        </Media.Root>);
        const video = screen.container.querySelector("video")!;
        page.getByRole("button", { name: "Reserved key" }).element().focus();
        await userEvent.keyboard("k");
        expect(video.paused).toBe(true);
        page.getByRole("button", { name: "Toolbar", exact: true }).element().focus();
        await userEvent.keyboard("m");
        expect(video.muted).toBe(enabled);
        await screen.unmount();
    }
});
