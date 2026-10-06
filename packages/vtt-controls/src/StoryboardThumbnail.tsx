import { ComponentPropsWithRef, forwardRef, ForwardRefExoticComponent, RefAttributes, useEffect, useState } from "react";
import { useMediaTextTrack } from "@react-av/vtt";

export type StoryboardThumbnailProps = Omit<ComponentPropsWithRef<'img'>, "src" | "srcSet"> & {
    timestamp: number,
    storyboardId: string
}

const ALLOWED_IMAGE_PROTOCOLS = ["http:", "https:", "blob:", "data:"];
const MAX_THUMBNAIL_SIZE = 4096;

function parseStoryboardUrl(cueText: string) {
    try {
        const url = new URL(cueText.trim(), document.baseURI);
        if (!ALLOWED_IMAGE_PROTOCOLS.includes(url.protocol)) return undefined;
        return url;
    } catch {
        return undefined;
    }
}

function parseXYWH(value: string) {
    const parts = value.split(",");
    if (parts.length !== 4) return undefined;
    if (!parts.every(part => /^\d+$/.test(part.trim()))) return undefined;
    const [x, y, w, h] = parts.map(part => parseInt(part, 10)) as [number, number, number, number];
    if (w === 0 || h === 0 || w > MAX_THUMBNAIL_SIZE || h > MAX_THUMBNAIL_SIZE) return undefined;
    return { x, y, w, h };
}

const StoryboardThumbnail = forwardRef<HTMLImageElement, StoryboardThumbnailProps>(function StoryboardThumbnail({ timestamp, storyboardId, ...props }, ref) {
    const [cues] = useMediaTextTrack(storyboardId);

    const [blob, setBlob] = useState<string>();

    const [lastImage, setLastImage] = useState<HTMLImageElement>();
    const [lastImageUrl, setLastImageUrl] = useState<string>();
    const [lastXYWH, setLastXYWH] = useState<string>();

    useEffect(() => {
        const cue = cues.find(cue => cue.startTime <= timestamp && cue.endTime >= timestamp);
        if (!cue) return;

        const url = parseStoryboardUrl(cue.text);
        if (!url) return;

        const hash = url.hash.substring(1);

        const params = new URLSearchParams(hash);

        const xywhParam = params.get("xywh");
        if (!xywhParam) return;

        const region = parseXYWH(xywhParam);
        if (!region) return;
        const { x, y, w, h } = region;

        url.hash = "";

        if (lastXYWH === xywhParam && lastImageUrl === url.href) return;

        setLastXYWH(xywhParam);

        async function extractImage(image: HTMLImageElement) {
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
            if (!blob) return;
            setBlob(URL.createObjectURL(blob));
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
    }, [blob]);

    return <img {...props} src={blob} ref={ref} />;
});

export default StoryboardThumbnail;
