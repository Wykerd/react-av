import { MediaReadyState, useMediaElement, useMediaReadyState } from "@react-av/core";
import { useEffect } from "react";

export function VideoRatio({
    fallback,
    onAspectRatio
}: {
    fallback: number,
    onAspectRatio: (ratio: number) => unknown
}) {
    const video = useMediaElement();
    const ready = useMediaReadyState();

    useEffect(() => {
        if ((ready < MediaReadyState.HAVE_METADATA) || !video || video.nodeName !== 'VIDEO') {
            onAspectRatio(fallback);
            return;
        }

        const { videoWidth, videoHeight } = (video as HTMLVideoElement);

        onAspectRatio(videoWidth / videoHeight);
    }, [video, ready, onAspectRatio, fallback]);

    return null;
}