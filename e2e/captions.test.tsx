import * as Media from "@react-av/core";
import { PlayPause } from "@react-av/controls";
import { Track } from "@react-av/vtt";
import { CaptionsToggle } from "@react-av/vtt-controls";
import { render } from "vitest-browser-react";
import captions from "./fixtures/captions.vtt";
import otherCaptions from "./fixtures/other-captions.vtt";
import clip from "./fixtures/clip.webm";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderPlayer } from "./player";

test("the Captions button hides the captions and shows them again", async () => {
    await renderPlayer();
    const captionsButton = page.getByRole("button", { name: "Captions" });
    const caption = page.getByText("Captions are on");

    await userEvent.click(page.getByRole("button", { name: "Play" }));
    await expect.element(caption).toBeVisible();
    await expect.element(captionsButton).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(captionsButton);
    await expect.element(captionsButton).toHaveAttribute("aria-pressed", "false");
    await expect.element(caption).not.toBeInTheDocument();

    await userEvent.click(captionsButton);
    await expect.element(captionsButton).toHaveAttribute("aria-pressed", "true");
    await expect.element(caption).toBeVisible();
});


test("the toggle restores the selected caption track and disables without tracks", async () => {
    const screen = await render(<Media.Root>
        <Media.Container><Media.Video src={clip} /></Media.Container>
        <Track kind="subtitles" label="Other" src={otherCaptions} />
        <Track kind="captions" label="Default" src={captions} default />
        <PlayPause /><CaptionsToggle /><CaptionsToggle />
    </Media.Root>);
    const button = page.getByRole("button", { name: "Captions" }).first();
    await userEvent.click(page.getByRole("button", { name: "Play" }));
    await expect.element(page.getByText("Captions are on")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Pause" }));
    await userEvent.click(button);
    await expect.element(page.getByText("Captions are on")).not.toBeInTheDocument();
    await userEvent.click(page.getByRole("button", { name: "Captions" }).last());
    await expect.element(page.getByText("Captions are on")).toBeVisible();
    await expect.element(page.getByText("Other captions")).not.toBeInTheDocument();
    await screen.unmount();
    await render(<Media.Root><Media.Container><Media.Video src={clip} /></Media.Container><CaptionsToggle /></Media.Root>);
    await expect.element(page.getByRole("button", { name: "Captions" })).toBeDisabled();
});
