import React, { ComponentProps, forwardRef, useEffect, useRef } from "react";
import Hls from 'hls.js';
import { Video, Audio, useMediaOpaque } from "@react-av/core";

export interface HLSContext {
    instance?: Hls;
    isNative: boolean;
}

export function useMediaHLS() {
    const [hls] = useMediaOpaque<HLSContext>('react-av:hls');
    return hls;
}

export const HLSVideo = forwardRef<HTMLVideoElement, ComponentProps<typeof Video> & { src: string }>(function HLSVideo({ src, children, ...props }, f_ref) {
    const ref = useRef<HTMLVideoElement>(null);
    const [, setHLS] = useMediaOpaque<HLSContext>('react-av:hls');

    useEffect(() => {
        const video = ref.current;
        if (!video) return;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            setHLS({
                isNative: true
            });
        } else if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            setHLS({
                instance: hls,
                isNative: false
            });
            return () => {
                // TODO: first class support for resetting value
                setHLS(undefined as any);
                hls.destroy();
            };
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
    }}>
        {children}
    </Video>;
});

export const HLSAudio = forwardRef<HTMLAudioElement, ComponentProps<typeof Audio> & { src: string }>(function HLSAudio({ src, children, ...props }, f_ref) {
    const ref = useRef<HTMLAudioElement>(null);
    const [, setHLS] = useMediaOpaque<HLSContext>('react-av:hls');

    useEffect(() => {
        const audio = ref.current;
        if (!audio) return;
        if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            audio.src = src;
            setHLS({
                isNative: true
            });
        } else if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(audio);
            setHLS({
                instance: hls,
                isNative: false
            });
            return () => {
                // TODO: first class support for resetting value
                setHLS(undefined as any);
                hls.destroy();
            };
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
    }}>
        {children}
    </Audio>
});
