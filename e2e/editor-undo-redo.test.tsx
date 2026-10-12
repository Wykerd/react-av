import * as Media from "@react-av/core";
import { Editor, TimelineContainer, TimelineEditor, TimelineSubtitleCueEditor, TimelineSubtitlesTrack, toVTT, useTimelineSubtitleTrack } from "@react-av/editor";
import { Track } from "@react-av/vtt";
import { StrictMode, useState } from "react";
import { expect, test } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";

declare module "vitest/browser" {
    interface BrowserCommands {
        dragCue(text: string, deltaX: number, resize?: boolean): Promise<void>;
        createCue(start: number, end: number): Promise<void>;
    }
}

const captions = `data:text/vtt,${encodeURIComponent("WEBVTT\n\n00:00.500 --> 00:02.500\nFirst caption\n\n00:03.000 --> 00:03.800\nSecond caption")}`;

function HistoryButtons() {
    const { undo, redo, canUndo, canRedo } = useTimelineSubtitleTrack();
    return <div>
        <button disabled={!canUndo} onClick={undo}>Undo</button>
        <button disabled={!canRedo} onClick={redo}>Redo</button>
    </div>;
}

function SubtitleEditor() {
    const [saved, setSaved] = useState("");
    return <Media.Root>
        <Track id="captions" src={captions} />
        <Editor mediaComponent={<Media.Video src={clip} />} styling={{ timelineTimelineElementBase: { backgroundColor: "#ddd" } }}>
            <TimelineEditor>
                <TimelineContainer>
                    <TimelineSubtitlesTrack id="captions" onTrackCuesChanged={track => setSaved(toVTT(track))}>
                        <TimelineSubtitleCueEditor />
                        <HistoryButtons />
                    </TimelineSubtitlesTrack>
                </TimelineContainer>
            </TimelineEditor>
        </Editor>
        <label>Saved subtitles<textarea readOnly value={saved} /></label>
    </Media.Root>;
}

test("undo and redo restore text, a completed drag and a deleted cue", async () => {
    await render(<StrictMode><SubtitleEditor /></StrictMode>);
    const output = page.getByRole("textbox", { name: "Saved subtitles" });
    const undo = page.getByRole("button", { name: "Undo", exact: true });
    const redo = page.getByRole("button", { name: "Redo", exact: true });
    await userEvent.click(page.getByText("First caption", { exact: true }));
    await expect.element(undo).toBeDisabled();
    await userEvent.fill(page.getByRole("textbox", { name: "Cue Content" }), "Edited caption");
    await userEvent.click(page.getByRole("button", { name: "Back to Timeline" }));
    await expect.element(output).toHaveValue(expect.stringContaining("Edited caption"));
    const textOutput = (output.element() as HTMLTextAreaElement).value;
    await commands.dragCue("Edited caption", 20);
    await expect.element(output).not.toHaveValue(textOutput);
    const draggedOutput = (output.element() as HTMLTextAreaElement).value;
    await userEvent.click(page.getByRole("button", { name: "Delete", exact: true }));
    await expect.element(output).not.toHaveValue(expect.stringContaining("Edited caption"));
    const deletedOutput = (output.element() as HTMLTextAreaElement).value;

    await userEvent.click(undo);
    await expect.element(output).toHaveValue(draggedOutput);
    await userEvent.keyboard("{Control>}z{/Control}");
    await expect.element(output).toHaveValue(textOutput);
    await userEvent.click(undo);
    await expect.element(output).toHaveValue(expect.stringContaining("First caption"));
    await expect.element(undo).toBeDisabled();

    await userEvent.click(page.getByRole("button", { name: "Back to Timeline" }));
    await userEvent.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");
    await expect.element(output).toHaveValue(textOutput);
    await userEvent.keyboard("{Control>}y{/Control}");
    await expect.element(output).toHaveValue(draggedOutput);
    await userEvent.click(redo);
    await expect.element(output).toHaveValue(deletedOutput);
    await expect.element(redo).toBeDisabled();
});


test("adding and resizing cues can be undone and a new edit clears redo", async () => {
    await render(<StrictMode><SubtitleEditor /></StrictMode>);
    const output = page.getByRole("textbox", { name: "Saved subtitles" });
    const undo = page.getByRole("button", { name: "Undo", exact: true });
    const redo = page.getByRole("button", { name: "Redo", exact: true });
    await userEvent.click(page.getByText("First caption", { exact: true }));
    await commands.dragCue("First caption", -8, true);
    await expect.element(output).toHaveValue(expect.stringContaining("First caption"));
    const resized = (output.element() as HTMLTextAreaElement).value;
    await userEvent.click(undo);
    await expect.element(output).not.toHaveValue(resized);
    const original = (output.element() as HTMLTextAreaElement).value;
    await userEvent.click(redo);
    await expect.element(output).toHaveValue(resized);
    await userEvent.click(undo);

    await commands.createCue(0.05, 0.4);
    await expect.element(output).toHaveValue(expect.stringContaining("New Subtitle"));
    await expect.element(redo).toBeDisabled();
    await userEvent.click(undo);
    await expect.element(output).toHaveValue(original);
    await userEvent.click(redo);
    await expect.element(output).toHaveValue(expect.stringContaining("New Subtitle"));
});

test("history shortcuts affect only the focused editor and leave text fields alone", async () => {
    await render(<StrictMode>
        <section aria-label="First editor"><SubtitleEditor /></section>
        <section aria-label="Second editor"><SubtitleEditor /></section>
    </StrictMode>);
    const first = page.getByRole("region", { name: "First editor" });
    const second = page.getByRole("region", { name: "Second editor" });
    await userEvent.click(first.getByText("First caption", { exact: true }));
    await userEvent.fill(first.getByRole("textbox", { name: "Cue Content" }), "First edit");
    await userEvent.click(second.getByText("First caption", { exact: true }));
    await userEvent.fill(second.getByRole("textbox", { name: "Cue Content" }), "Second edit");
    const secondOutput = second.getByRole("textbox", { name: "Saved subtitles" });
    await expect.element(secondOutput).toHaveValue(expect.stringContaining("Second edit"));
    await userEvent.keyboard("{Control>}y{/Control}");
    await expect.element(secondOutput).toHaveValue(expect.stringContaining("Second edit"));
    await expect.element(second.getByRole("button", { name: "Undo", exact: true })).toBeEnabled();
    await userEvent.click(first.getByRole("button", { name: "Back to Timeline" }));
    await userEvent.keyboard("{Meta>}z{/Meta}");
    await expect.element(first.getByRole("textbox", { name: "Saved subtitles" })).toHaveValue(expect.stringContaining("First caption"));
    await expect.element(secondOutput).toHaveValue(expect.stringContaining("Second edit"));
});
