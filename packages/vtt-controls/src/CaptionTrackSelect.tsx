import { ChangeEvent, ComponentPropsWithRef, forwardRef } from "react";
import VTT, { TextTrack } from "@react-av/vtt-core";
import { useMediaElement } from "@react-av/core";
import { useMediaTextTrackList } from "@react-av/vtt";

export type CaptionTrackSelectProps = Omit<ComponentPropsWithRef<'select'>, "value" | "defaultValue" | "multiple" | "children"> & {
    offLabel?: string
}

function isCaptionTrack(track: TextTrack) {
    return track.kind === "subtitles" || track.kind === "captions";
}

export function useMediaCaptionTracks() {
    const media = useMediaElement();
    const tracks = useMediaTextTrackList()?.filter(isCaptionTrack) ?? [];
    const selected = tracks.find(track => track.mode === "showing") ?? null;

    function select(selectedTrack: TextTrack | null) {
        if (!media) return;
        for (const track of tracks) {
            track.mode = track === selectedTrack ? "showing" : "hidden";
        }
        VTT.getContext(media)?.tracksChanged.dispatchEvent(new CustomEvent("change"));
        VTT.updateTextTrackDisplay(media, tracks);
    }

    return { tracks, selected, select };
}

const CaptionTrackSelect = forwardRef<HTMLSelectElement, CaptionTrackSelectProps>(function CaptionTrackSelect({ offLabel = "Off", onChange, ...props }, ref) {
    const { tracks, selected, select } = useMediaCaptionTracks();

    let value = "";
    if (selected) value = String(tracks.indexOf(selected));

    function handleChange(event: ChangeEvent<HTMLSelectElement>) {
        onChange?.(event);
        const optionValue = event.target.value;
        if (optionValue === "") select(null);
        else select(tracks[Number(optionValue)]);
    }

    return <select aria-label="Captions" {...props} ref={ref} value={value} onChange={handleChange}>
        <option value="">{offLabel}</option>
        {tracks.map((track, index) => <option key={index} value={index}>
            {track.label || track.language || `Track ${index + 1}`}
        </option>)}
    </select>;
});

export default CaptionTrackSelect;
