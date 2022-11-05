import { useEffect } from "react";
import VTT, { Track as TextTrack, HTMLTrackElementAttributes } from '@react-av/vtt-core';
import { useMediaElement } from "@react-av/core";

export default function Track({ kind, srclang, label, src, id, ...props } : HTMLTrackElementAttributes) {
    const element = useMediaElement();

    useEffect(() => {
        if (!element) return;
        VTT.ref(element);
        VTT.observeResize(element);

        const track = new TextTrack(element, {
            kind,
            srclang,
            label,
            src,
            id,
            default: props.default
        });

        return () => {
            VTT.deref(element);
            track.remove();
        }
    }, [element, kind, srclang, label, src, id, props.default]);

    return null;
}