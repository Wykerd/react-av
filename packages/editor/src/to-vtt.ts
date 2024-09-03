import { type TextTrack, type VTTCue, toTimestampString } from "@react-av/vtt-core";

export function toVTT(track: TextTrack) {
    const cues = track.cues ?? [];
    const lines = cues
        .sort((a, b) => a.startTime - b.startTime)
        .map(cue => {
            return `${toTimestampString(cue.startTime)} --> ${toTimestampString(cue.endTime)}\n${(cue as VTTCue).text}`;
        });
    return `WEBVTT\n\n${lines.join('\n\n')}`;
}