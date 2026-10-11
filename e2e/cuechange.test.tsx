import { PlayPause } from "@react-av/controls";
import * as Media from "@react-av/core";
import { Track } from "@react-av/vtt";
import VTT from "@react-av/vtt-core";
import { StrictMode } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";

const captions = `data:text/vtt,${encodeURIComponent(`WEBVTT

first
00:00.250 --> 00:00.750
First line

second
00:01.000 --> 00:01.500
Second line
`)}`;

test("a caption track fires cuechange as playback enters and leaves each cue", async () => {
    const screen = await render(
        <StrictMode>
            <Media.Root>
                <Media.Container>
                    <Media.Video src={clip} />
                </Media.Container>
                <Track id="captions" kind="captions" src={captions} />
                <PlayPause />
            </Media.Root>
        </StrictMode>,
    );
    const video = screen.container.querySelector("video")!;
    const track = VTT.getTrackById(video, "captions")!;
    const activeCueIdsOnEachChange: string[][] = [];
    track.addEventListener("cuechange", () => {
        const activeCueIds = track.activeCues?.map(cue => cue.id) ?? [];
        activeCueIdsOnEachChange.push(activeCueIds);
    });

    await userEvent.click(page.getByRole("button", { name: "Play" }));

    await expect
        .poll(() => activeCueIdsOnEachChange, { timeout: 4000 })
        .toEqual([["first"], [], ["second"], []]);
});
