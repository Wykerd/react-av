import React, { ComponentPropsWithoutRef, forwardRef, useEffect, useRef, useState } from "react";
import VTT, { TextTrack, VTTCue } from '@react-av/vtt-core';
import { useMediaElement } from "@react-av/core";

export function useMediaTextTrack(id: string) {
    const media = useMediaElement();

    const [activeCues, setActiveCues] = useState<VTTCue[]>([]);
    const [cues, setCues] = useState<VTTCue[]>([]);

    useEffect(() => {
        if (!media) return;
        VTT.ref(media);
        function update() {
            if (!media) return;
            const track = VTT.getTrackById(media, id);
            if (!track) return;
            const cues = track.cues;
            if (!cues) return;
            const orderedCues = cues.sort((a, b) => {
                if (a.startTime === b.startTime)
                    return b.endTime - a.endTime;
                return a.startTime - b.startTime;
            });
            const activeCues = orderedCues.filter(cue => cue.startTime <= media.currentTime && cue.endTime > media.currentTime);
            setCues(orderedCues as VTTCue[]);
            setActiveCues(activeCues as VTTCue[]);
        }

        VTT.getContext(media)?.tracksChanged.addEventListener("change", update);
        VTT.getContext(media)?.tracksChanged.addEventListener("cuechange", update);
        VTT.getContext(media)?.updateRules.add(update);
        update();

        return () => {
            VTT.getContext(media)?.tracksChanged.removeEventListener("change", update);
            VTT.getContext(media)?.tracksChanged.removeEventListener("cuechange", update);
            VTT.getContext(media)?.updateRules.delete(update);
            VTT.deref(media);
        }
    }, [media, id]);

    return [cues, activeCues] as const;
}

export function useMediaTextTrackList() {
    const media = useMediaElement();

    const [tracks, setTracks] = useState<TextTrack[]>();

    useEffect(() => {
        if (!media) return;
        VTT.ref(media);
        function update() {
            if (!media) return;
            const list = VTT.getContext(media)?.tracks;
            if (!list) return;
            setTracks([...list]);
        }

        VTT.getContext(media)?.tracksChanged.addEventListener("change", update);
        update();

        return () => {
            VTT.getContext(media)?.tracksChanged.removeEventListener("change", update);
            VTT.deref(media);
        }
    }, [media]);

    return tracks;
}

// TODO: this should be redone
// see: https://www.benmvp.com/blog/forwarding-refs-polymorphic-react-component-typescript/
// see: https://stackoverflow.com/questions/62238716/using-ref-current-in-react-forwardref (useImperativeHandle)

export const Cue = forwardRef(function Cue<T extends keyof HTMLElementTagNameMap>({ as, cue, ...props }: { as: T, cue: VTTCue } & Omit<ComponentPropsWithoutRef<T>, "children">, ref: React.Ref<HTMLElementTagNameMap[T]>) {
    const i_ref = useRef<HTMLElement>();
    useEffect(() => {
        if (!i_ref.current) return;
        i_ref.current.innerHTML = "";
        i_ref.current.append(cue.getCueAsHTML());
    }, [cue]);
    const As = (as) as string;
    // @ts-ignore
    return <As {...props} ref={current => {
        i_ref.current = current;
        if (typeof ref === "function") ref(current);
        // @ts-ignore
        else if (ref) ref.current = current;
    }} />;
});
