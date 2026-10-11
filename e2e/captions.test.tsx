import { useState } from "react";
import VTT from "@react-av/vtt-core";
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


test("apps can disable the captions button when a track is available", async () => {
    await render(<Media.Root><Media.Container><Media.Video src={clip} /></Media.Container>
        <Track kind="captions" src={captions} default /><CaptionsToggle disabled /><PlayPause />
    </Media.Root>);
    await userEvent.click(page.getByRole("button", { name: "Play", exact: true }));
    await expect.element(page.getByText("Captions are on")).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Captions" })).toBeDisabled();
});

function DelayedCaptionsToolbar() {
    const media = Media.useMediaElement();
    const [visible, setVisible] = useState(false);
    return <><button onClick={() => {
        const context = VTT.getContext(media!)!;
        for (const track of context.tracks) track.mode = "hidden";
        context.tracksChanged.dispatchEvent(new CustomEvent("change", { detail: context }));
        VTT.updateTextTrackDisplay(media!, context.tracks);
        setVisible(true);
    }}>Hide captions and open toolbar</button>{visible && <CaptionsToggle />}</>;
}

test("a newly opened captions toolbar selects the default language", async () => {
    await render(<Media.Root><Media.Container><Media.Video src={clip} /></Media.Container>
        <Track kind="subtitles" label="Other" src={otherCaptions} />
        <Track kind="captions" label="Default" src={captions} default />
        <DelayedCaptionsToolbar /><PlayPause />
    </Media.Root>);
    await userEvent.click(page.getByRole("button", { name: "Play", exact: true }));
    await expect.element(page.getByText("Captions are on")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Pause", exact: true }));
    await userEvent.click(page.getByRole("button", { name: "Hide captions and open toolbar" }));
    await userEvent.click(page.getByRole("button", { name: "Captions", exact: true }));
    await expect.element(page.getByText("Captions are on")).toBeVisible();
    await expect.element(page.getByText("Other captions")).not.toBeInTheDocument();
});
