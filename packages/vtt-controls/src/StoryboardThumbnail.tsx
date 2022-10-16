import React, { forwardRef, HTMLAttributes, useEffect, useState } from "react";
import { useMediaTextTrack } from "@react-av/vtt";

const StoryboardThumbnail = forwardRef<HTMLImageElement, { timestamp: number, storyboardId: string } & Omit<HTMLAttributes<HTMLImageElement>, "src" | "srcSet">>(function StoryboardThumbnail({ timestamp, storyboardId, ...props }, ref) {
    const [cues] = useMediaTextTrack(storyboardId);

    const [blob, setBlob] = useState<string>();

    const [lastImage, setLastImage] = useState<HTMLImageElement>();
    const [lastImageUrl, setLastImageUrl] = useState<string>();
    const [lastXYWH, setLastXYWH] = useState<string>();

    useEffect(() => {
        const cue = cues.find(cue => cue.startTime <= timestamp && cue.endTime >= timestamp);
        if (!cue) return;

        const url = new URL(cue.text);

        const hash = url.hash.substring(1);

        const params = new URLSearchParams(hash);

        if (!params.has("xywh")) return;

        const [x, y, w, h] = params.get("xywh")!.split(",").map(s => parseInt(s));

        url.hash = "";

        if (lastXYWH === params.get("xywh")! && lastImageUrl === url.href) return;
        else URL.revokeObjectURL(lastImageUrl!);

        setLastXYWH(params.get("xywh")!);

        let blobUrl: string | undefined;

        async function extractImage(image: HTMLImageElement) {
            if (x === undefined || Number.isNaN(x) || y === undefined || Number.isNaN(y) || w === undefined || Number.isNaN(w) || h === undefined || Number.isNaN(h)) return;

            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
            if (!blob) return;
            blobUrl = URL.createObjectURL(blob);
            setBlob(blobUrl);
        }

        if (lastImage && lastImageUrl === url.href) {
            extractImage(lastImage);
        } else {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = async () => {
                setLastImage(img);
                setLastImageUrl(url.href);
                extractImage(img);
            }
            img.src = url.href;
        }
    }, [cues, timestamp]);

    useEffect(() => {
        return () => {
            if (blob) URL.revokeObjectURL(blob);
        }
    }, []);

    return <img {...props} src={blob} ref={ref} />;
});

export default StoryboardThumbnail;
