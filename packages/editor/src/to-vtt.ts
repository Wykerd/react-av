import { type TextTrack, type VTTCue, toTimestampString } from "@react-av/vtt-core";

function toSafeCuePayload(text: string) {
    return text
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .filter(line => line.trim() !== "")
        .join("\n")
        .replace(/-->/g, "--&gt;");
}

export function toVTT(track: TextTrack) {
    const cues = track.cues ?? [];
    const lines = cues
        .sort((a, b) => a.startTime - b.startTime)
        .map(cue => {
            return `${toTimestampString(cue.startTime)} --> ${toTimestampString(cue.endTime)}\n${toSafeCuePayload((cue as VTTCue).text)}`;
        });
    return `WEBVTT\n\n${lines.join('\n\n')}`;
}
