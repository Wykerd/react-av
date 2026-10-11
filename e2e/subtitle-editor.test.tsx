import * as Media from "@react-av/core";
import { Editor, TimelineContainer, TimelineEditor, TimelineSubtitleCueEditor, TimelineSubtitlesTrack, toVTT } from "@react-av/editor";
import { Track } from "@react-av/vtt";
import { StrictMode, useState } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";
import positionedCaptions from "./fixtures/positioned-captions.vtt";

function SubtitleEditor() {
    const [subtitles, setSubtitles] = useState("");

    return (
        <Media.Root>
            <Track id="captions" kind="subtitles" srclang="en" label="English" src={positionedCaptions} />
            <Editor mediaComponent={<Media.Video src={clip} />}>
                <TimelineEditor>
                    <TimelineContainer>
                        <TimelineSubtitlesTrack id="captions" onTrackCuesChanged={track => setSubtitles(toVTT(track))}>
                            <TimelineSubtitleCueEditor />
                        </TimelineSubtitlesTrack>
                    </TimelineContainer>
                </TimelineEditor>
            </Editor>
            <label>
                WebVTT output
                <textarea value={subtitles} readOnly />
            </label>
        </Media.Root>
    );
}

test("saving edited subtitles keeps cue IDs and positioning", async () => {
    await render(<StrictMode><SubtitleEditor /></StrictMode>);

    await userEvent.click(page.getByText("Welcome to the lesson."));
    await userEvent.fill(page.getByRole("textbox", { name: "Cue Content" }), "Welcome back.");

    await expect.element(page.getByRole("textbox", { name: "WebVTT output" })).toHaveValue(
        [
            "WEBVTT",
            "",
            "intro",
            "00:00:00.000 --> 00:00:01.500 line:10%,end position:20%,line-left size:50% align:start",
            "Welcome back.",
            "",
            "00:00:01.500 --> 00:00:03.000 vertical:rl position:90%",
            "Captions keep their place.",
            "",
            "outro",
            "00:00:03.000 --> 00:00:04.000",
            "Thanks for watching.",
        ].join("\n"),
    );
});
