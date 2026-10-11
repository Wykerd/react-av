import * as Media from "@react-av/core";
import { Editor, TimelineContainer, TimelineEditor, TimelineSubtitleCueEditor, TimelineSubtitlesTrack, toVTT } from "@react-av/editor";
import { Track } from "@react-av/vtt";
import { VTTParser } from "@react-av/vtt-core";
import { StrictMode, useState } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";

const source = `WEBVTT

STYLE
::cue { color: red; }

REGION
id:bottom width:60% lines:4 regionanchor:0%,100% viewportanchor:0%,100%

STYLE
::cue(b) { font-weight: bold; }

intro
00:00.000 --> 00:01.000 region:bottom
Hello`;

function SubtitleEditor() {
    const [saved, setSaved] = useState("");
    return <Media.Root>
        <Track id="captions" src={`data:text/vtt,${encodeURIComponent(source)}`} />
        <Editor mediaComponent={<Media.Video src={clip} />}>
            <TimelineEditor>
                <TimelineContainer>
                    <TimelineSubtitlesTrack id="captions" onTrackCuesChanged={track => setSaved(toVTT(track))}>
                        <TimelineSubtitleCueEditor />
                    </TimelineSubtitlesTrack>
                </TimelineContainer>
            </TimelineEditor>
        </Editor>
        <label>Saved subtitles<textarea readOnly value={saved} /></label>
    </Media.Root>;
}

test("editing and saving captions keeps styles, regions and cue references", async () => {
    await render(<StrictMode><SubtitleEditor /></StrictMode>);
    await userEvent.click(page.getByText("Hello", { exact: true }));
    await userEvent.fill(page.getByRole("textbox", { name: "Cue Content" }), "Hello again");
    const output = page.getByRole("textbox", { name: "Saved subtitles" });
    await expect.element(output).toHaveValue(expect.stringContaining("Hello again"));
    const restored = new VTTParser((output.element() as HTMLTextAreaElement).value);
    const original = new VTTParser(source);
    expect(restored.stylesheets).toEqual(original.stylesheets);
    expect(restored.regions).toEqual(original.regions);
    expect(restored.cues[0]?.region?.id).toBe("bottom");
    expect(restored.cues[0]?.id).toBe("intro");
});
