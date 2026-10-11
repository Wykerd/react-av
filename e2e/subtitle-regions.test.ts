import { toVTT } from "@react-av/editor";
import { VTTParser } from "@react-av/vtt-core";
import { expect, test } from "vitest";

const source = `WEBVTT

REGION
id:bottom width:60% lines:4 regionanchor:25%,75% viewportanchor:30%,90% scroll:up

REGION
id:top width:100% lines:3 regionanchor:0%,100% viewportanchor:0%,100%

intro
00:00.000 --> 00:01.000 region:bottom
Hello

00:01.000 --> 00:02.000 region:top
Goodbye`;

test("saving subtitles keeps region definitions and cue references", () => {
    const original = new VTTParser(source);
    const track = original.textTrack("subtitles");
    track.cues![0]!.text = "Hello again";
    const saved = toVTT(track);
    const restored = new VTTParser(saved);

    expect(restored.regions).toEqual(original.regions);
    expect(restored.cues.map(cue => cue.region?.id)).toEqual(["bottom", "top"]);
    expect(restored.cues[0]?.text).toBe("Hello again");
    expect(saved.indexOf("REGION")).toBeLessThan(saved.indexOf("intro"));
});
