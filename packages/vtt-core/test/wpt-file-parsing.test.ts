/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VTTParser } from "../src";
import expectedCues from "./wpt-file-parsing/expected-cues.json";

const invalidSignatures = [
    "empty",
    "signature-formfeed",
    "signature-invalid-whitespace",
    "signature-lowercase",
    "signature-missing",
    "signature-missing-whitespace",
    "signature-null",
    "signature-partial",
    "signature-two-boms",
];

function readFixture(name: string) {
    const bytes = readFileSync(new URL(`./wpt-file-parsing/${name}.vtt`, import.meta.url));
    return new TextDecoder().decode(bytes);
}

describe("WebVTT file parsing (web-platform-tests)", () => {
    for (const [name, cues] of Object.entries(expectedCues)) {
        it(name, () => {
            const parser = new VTTParser(readFixture(name));
            expect(parser.cues).toMatchObject(cues);
        });
    }

    for (const name of invalidSignatures) {
        it(name, () => {
            expect(() => new VTTParser(readFixture(name))).toThrow("Invalid WebVTT file signature");
        });
    }
});
