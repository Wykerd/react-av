import React, { forwardRef, HTMLProps } from "react";
import { useMediaCurrentTime, useMediaDuration } from "@react-av/core";

export function toTimestampString(timestampSeconds: number,  includeHours: boolean) {
    const hours = Math.floor(timestampSeconds / 3600);
    const minutes = Math.floor(timestampSeconds / 60) % 60;
    const seconds = Math.floor(timestampSeconds % 60);
    if (!includeHours) 
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    return `${hours.toString().padStart(1, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export type TimestampProps = HTMLProps<HTMLSpanElement> & {
    type: "duration" | "remaining" | "elapsed";
}

const Timestamp = forwardRef<HTMLSpanElement, TimestampProps>(function Timestamp({ 
    type, 
    ...props 
}, ref) {
    const [curenntTime] = useMediaCurrentTime();
    const duration = useMediaDuration();

    const includeHours = duration >= 3600;

    const timestamp = type === "duration" ? duration : type === "remaining" ? duration - curenntTime : curenntTime;

    return <span ref={ref} {...props}>{toTimestampString(timestamp, includeHours)}</span>
});

export default Timestamp;