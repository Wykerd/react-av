import React, { ComponentProps, forwardRef, useEffect, useRef } from "react";
import Hls from 'hls.js';
import { Video } from "@react-av/core";

const HLSVideo = forwardRef<HTMLVideoElement, ComponentProps<typeof Video> & { src: string }>(function HLSVideo({ src, ...props }, f_ref) {
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
        } else {
            // TODO: fallback
        }
    }, []);

    return <Video {...props} ref={current => {
        if (typeof f_ref === "function") f_ref(current);
        // @ts-ignore
        else if (f_ref) f_ref.current = current;
        // @ts-ignore
        ref.current = current;
    }} />;
});

export default HLSVideo;