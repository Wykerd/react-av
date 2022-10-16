import React, { HTMLProps, ReactNode } from "react";
import { useMediaBuffered, useMediaDuration } from "@react-av/core";

export default function ProgressBarBufferedRanges({style, ...props}: HTMLProps<HTMLSpanElement>) {
    const buffered = useMediaBuffered();
    const duration = useMediaDuration();

    const ranges: ReactNode[] = [];

    if (buffered) for (let i = 0; i < buffered.length; i++) {
        const start = buffered.start(i);
        const end = buffered.end(i);

        ranges.push(<span key={i} {...props} style={{...style, left: `${(start / duration) * 100}%`, width: `${((end - start) / duration) * 100}%`}}/>);
    }

    return <>
        {
            ranges
        }
    </>
}