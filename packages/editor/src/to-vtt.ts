import { type TextTrack, type VTTCue, toTimestampString } from "@react-av/vtt-core";

function toSafeCuePayload(text: string) {
    return text
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .filter(line => line.trim() !== "")
        .join("\n")
        .replace(/-->/g, "--&gt;");
}

function toCueSettings(cue: VTTCue) {
    const settings: string[] = [];
    if (cue.vertical !== "") settings.push(`vertical:${cue.vertical}`);
    if (cue.line !== "auto") {
        let line = `line:${cue.line}`;
        if (!cue.snapToLines) line += "%";
        if (cue.lineAlign !== "start") line += `,${cue.lineAlign}`;
        settings.push(line);
    }
    if (cue.position !== "auto") {
        let position = `position:${cue.position}%`;
        if (cue.positionAlign !== "auto") position += `,${cue.positionAlign}`;
        settings.push(position);
    }
    if (cue.size !== 100) settings.push(`size:${cue.size}%`);
    if (cue.align !== "center") settings.push(`align:${cue.align}`);
    return settings;
}

function toCueBlock(cue: VTTCue) {
    const lines: string[] = [];
    if (cue.id !== "") lines.push(cue.id);
    const timings = `${toTimestampString(cue.startTime)} --> ${toTimestampString(cue.endTime)}`;
    lines.push([timings, ...toCueSettings(cue)].join(" "));
    lines.push(toSafeCuePayload(cue.text));
    return lines.join("\n");
}

export function toVTT(track: TextTrack) {
    const cues = [...(track.cues ?? [])] as VTTCue[];
    const lines = cues
        .sort((a, b) => a.startTime - b.startTime)
        .map(toCueBlock);
    return `WEBVTT\n\n${lines.join('\n\n')}`;
}
