import { useCallback, useEffect, useState } from "react";
import type shaka from "shaka-player/dist/shaka-player.compiled";
import { useMediaShaka } from "./index.js";

export interface ShakaQuality {
    id: number;
    height: number;
    bitrate: number;
}

function readQualities(player: shaka.Player | null) {
    const tracks = player?.getVariantTracks() ?? [];
    const activeTrack = tracks.find(track => track.active);
    const qualities: ShakaQuality[] = [];
    for (const track of tracks) {
        if (!track.height || (activeTrack && track.language !== activeTrack.language)) continue;
        const bitrate = track.videoBandwidth ?? track.bandwidth;
        if (qualities.some(quality => quality.height === track.height && quality.bitrate === bitrate)) continue;
        qualities.push({ id: track.id, height: track.height, bitrate });
    }
    qualities.sort((first, second) => first.height - second.height || first.bitrate - second.bitrate);
    const active = qualities.find(quality => quality.height === activeTrack?.height && quality.bitrate === (activeTrack?.videoBandwidth ?? activeTrack?.bandwidth)) ?? null;
    return { qualities, active, automatic: player?.getConfiguration().abr.enabled ?? true };
}

export function useMediaShakaQualities() {
    const player = useMediaShaka();
    const [state, setState] = useState(() => readQualities(player));
    useEffect(() => {
        const update = () => setState(previous => {
            const next = readQualities(player);
            if (previous.active?.id === next.active?.id && previous.automatic === next.automatic &&
                previous.qualities.length === next.qualities.length && previous.qualities.every((quality, index) =>
                    quality.id === next.qualities[index].id && quality.height === next.qualities[index].height && quality.bitrate === next.qualities[index].bitrate)) return previous;
            return next;
        });
        const events = ["trackschanged", "variantchanged", "adaptation", "abrstatuschanged"];
        update();
        events.forEach(event => player?.addEventListener(event, update));
        return () => events.forEach(event => player?.removeEventListener(event, update));
    }, [player]);
    const selectQuality = useCallback((quality: ShakaQuality | "auto") => {
        if (!player) return;
        if (quality === "auto") {
            player.configure({ abr: { enabled: true } });
            return;
        }
        const track = player.getVariantTracks().find(track => track.id === quality.id);
        if (!track) return;
        player.configure({ abr: { enabled: false } });
        const clearBuffer = true;
        const safeMargin = 2;
        player.selectVariantTrack(track, clearBuffer, safeMargin);
    }, [player]);
    return { ...state, selectQuality };
}
