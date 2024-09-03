import React, { ComponentPropsWithoutRef, ReactNode } from "react";
import { useMediaBuffered, useMediaCurrentTime, useMediaDuration } from "@react-av/core";

export type ProgressBarBufferedRangesProps = ComponentPropsWithoutRef<'span'> & {
    all?: boolean;
}

export default function ProgressBarBufferedRanges({style, all, ...props}: ProgressBarBufferedRangesProps) {
    const buffered = useMediaBuffered();
    const duration = useMediaDuration();
    const [ currentTime ] = useMediaCurrentTime();

    const ranges: ReactNode[] = [];

    if (buffered) for (let i = 0; i < buffered.length; i++) {
        const start = buffered.start(i);
        const end = buffered.end(i);

        // if not all or if the range includes the current time
        if (all || (start <= currentTime && end > currentTime)) 
            ranges.push(<span key={i} {...props} style={{...style, left: `${(start / duration) * 100}%`, width: `${((end - start) / duration) * 100}%`}}/>);
    }

    return <>
        {
            ranges
        }
    </>
}