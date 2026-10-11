import { expect, test } from "vitest";
import { VTTParser } from "../src";

const cue = "00:00.000 --> 00:01.000\nHello";

test("retains ordered styles before cues on the parser and text track", () => {
    const styles = ["::cue { color: red; }", "::cue(b) {\nfont-weight: bold;\n}"];
    const parser = new VTTParser(`WEBVTT\n\nSTYLE\n${styles[0]}\n\nNOTE comment\n\nSTYLE\n${styles[1]}\n\n${cue}`);
    expect(parser.stylesheets).toEqual(styles);
    expect(parser.textTrack("subtitles")._stylesheets).toEqual(styles);
    parser.stylesheets.pop();
    expect(parser.stylesheets).toEqual(styles);
});

test("ignores styles after the first cue", () => {
    const parser = new VTTParser(`WEBVTT\n\n${cue}\n\nSTYLE\n::cue { color: red; }`);
    expect(parser.stylesheets).toEqual([]);
});

test("an arrow inside a style block ends its content and allows cue recovery", () => {
    const parser = new VTTParser(`WEBVTT\n\nSTYLE\n::cue { color: red; }\n${cue}`);
    expect(parser.stylesheets).toEqual(["::cue { color: red; }"]);
    expect(parser.cues[0]?.text).toBe("Hello");
    expect(new VTTParser("WEBVTT\n\nSTYLE\n::cue { content: '-->'; }").stylesheets).toEqual([]);
});
