import * as Select from "@radix-ui/react-select";
import { ComponentPropsWithoutRef, createContext, useContext } from "react";
import VTT, { TextTrack } from "@react-av/vtt-core";
import { useMediaElement } from "@react-av/core";
import { useMediaTextTrackList } from "@react-av/vtt";

export type CaptionTrackSelectRootProps = Omit<ComponentPropsWithoutRef<typeof Select.Root>, "value" | "defaultValue">;
export type CaptionTrackSelectItemsProps = Omit<ComponentPropsWithoutRef<typeof Select.Item>, "value" | "children"> & {
    offLabel?: string;
};

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

const CaptionTrackSelectContext = createContext<ReturnType<typeof useMediaCaptionTracks> | null>(null);

export function CaptionTrackSelectRoot({ onValueChange, ...props }: CaptionTrackSelectRootProps) {
    const state = useMediaCaptionTracks();
    const { tracks, selected, select } = state;

    let value = "off";
    if (selected) value = String(tracks.indexOf(selected));

    function handleValueChange(nextValue: string) {
        if (nextValue === "off") select(null);
        else {
            const track = tracks[Number(nextValue)];
            if (!track) return;
            select(track);
        }
        onValueChange?.(nextValue);
    }

    return <CaptionTrackSelectContext.Provider value={state}>
        <Select.Root {...props} value={value} onValueChange={handleValueChange} />
    </CaptionTrackSelectContext.Provider>;
}

export function CaptionTrackSelectItems({ offLabel = "Off", ...props }: CaptionTrackSelectItemsProps) {
    const state = useContext(CaptionTrackSelectContext);
    if (!state) throw new Error("CaptionTrackSelectItems must be wrapped in CaptionTrackSelectRoot");

    return <>
        <Select.Item {...props} value="off"><Select.ItemText>{offLabel}</Select.ItemText></Select.Item>
        {state.tracks.map((track, index) => <Select.Item {...props} key={index} value={String(index)}>
            <Select.ItemText>{track.label || track.language || `Track ${index + 1}`}</Select.ItemText>
        </Select.Item>)}
    </>;
}
