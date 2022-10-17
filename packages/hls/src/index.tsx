import React, { ComponentProps, forwardRef, useEffect, useRef } from "react";
import Hls from 'hls.js';
import { Video, Audio } from "@react-av/core";

export const HLSVideo = forwardRef<HTMLVideoElement, ComponentProps<typeof Video> & { src: string }>(function HLSVideo({ src, ...props }, f_ref) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            return () => hls.destroy();
        } else {
            // TODO: fallback
        }
    }, [src]);

    return <Video {...props} ref={current => {
        if (typeof f_ref === "function") f_ref(current);
        // @ts-ignore
        else if (f_ref) f_ref.current = current;
        // @ts-ignore
        ref.current = current;
    }} />;
});

export const HLSAudio = forwardRef<HTMLAudioElement, ComponentProps<typeof Audio> & { src: string }>(function HLSAudio({ src, ...props }, f_ref) {
    const ref = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = ref.current;
        if (!audio) return;
        if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            audio.src = src;
        } else if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(audio);
            return () => hls.destroy();
        } else {
            // TODO: fallback
        }
    }, [src]);

    return <Audio {...props} ref={current => {
        if (typeof f_ref === "function") f_ref(current);
        // @ts-ignore
        else if (f_ref) f_ref.current = current;
        // @ts-ignore
        ref.current = current;
    }} />
});
