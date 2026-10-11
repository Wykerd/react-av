import { PlayPause } from "@react-av/controls";
import * as Media from "@react-av/core";
import { Track } from "@react-av/vtt";
import { CaptionTrackSelect } from "@react-av/vtt-controls";
import { StrictMode } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";
import english from "./fixtures/english.vtt";
import french from "./fixtures/french.vtt";

test("choosing a caption language shows only its captions and Off hides them", async () => {
    await render(
        <StrictMode>
            <Media.Root>
                <Media.Container>
                    <Media.Video src={clip} />
                </Media.Container>
                <Track kind="subtitles" srclang="en" label="English" src={english} />
                <Track kind="subtitles" srclang="fr" src={french} />
                <PlayPause />
                <CaptionTrackSelect />
            </Media.Root>
        </StrictMode>,
    );
    const captions = page.getByRole("combobox", { name: "Captions" });
    await expect.element(captions).toHaveDisplayValue("Off");

    await userEvent.click(page.getByRole("button", { name: "Play" }));
    await userEvent.selectOptions(captions, "English");
    await expect.element(captions).toHaveDisplayValue("English");
    await expect.element(page.getByText("Hello, world")).toBeVisible();

    await userEvent.selectOptions(captions, "fr");
    await expect.element(page.getByText("Bonjour le monde")).toBeVisible();
    await expect.element(page.getByText("Hello, world")).not.toBeInTheDocument();

    await userEvent.selectOptions(captions, "Off");
    await expect.element(page.getByText("Bonjour le monde")).not.toBeInTheDocument();
});
