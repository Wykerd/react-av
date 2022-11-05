import { useEffect } from "react";
import VTT, { TextTrack, TextTrackKind, VTTParser } from '@react-av/vtt-core';
import { useMediaElement } from "@react-av/core";

// TODO: cleanup
export default function Track({ kind, language, label, src, id }: { kind: TextTrackKind, language: string, label?: string, src: string, id?: string }) {
    const element = useMediaElement();

    useEffect(() => {
        const controller = new AbortController();

        let track: TextTrack | null = null;

        if (!element) return;
        VTT.ref(element);
        VTT.observeResize(element);

        let isDone = false;

        (async () => {
            if (!element) return;
            const response = await fetch(src, { signal: controller.signal });
            const text = await response.text();
            isDone = true;
            const parser = new VTTParser(text);
            track = parser.textTrack(kind, language, label, id);
            VTT.addTrack(element, track);
        })().catch(e => console.warn('react-media(vtt): failed to load track.', e));

        return () => {
            if (element && track) VTT.removeTrack(element, track);
            VTT.deref(element);
            if (!isDone) controller.abort();
        }
    }, [element, kind, label, language, src, id]);

    return null;
}