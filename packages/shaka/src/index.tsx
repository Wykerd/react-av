import React, { ComponentProps, forwardRef, useEffect, useRef, useImperativeHandle, useCallback } from "react";
import shaka from 'shaka-player/dist/shaka-player.compiled'
import { Video, Audio, useMediaOpaque } from "@react-av/core";

export interface ShakaPlayerRef {
    player: unknown;
    retry: () => Promise<void>;
}

export type StreamingFormat = 'auto' | 'hls' | 'dash' | 'native';

export interface ShakaPlayerProps {
    src: string;
    format?: StreamingFormat;
    onPlayerReady?: (player: unknown) => void;
    shakaConfig?: any;
}

let polyfillsInstalled = false;
const ensurePolyfills = () => {
    if (!polyfillsInstalled) {
        shaka.polyfill.installAll();
        polyfillsInstalled = true;
    }
};

const detectFormat = (src: string): 'hls' | 'dash' | 'unknown' => {
    try {
        if (src.includes('.m3u8') || src.includes('/hls/')) return 'hls';
        if (src.includes('.mpd') || src.includes('/dash/')) return 'dash';
        
        const url = new URL(src, window.location.href);
        const format = url.searchParams.get('format');
        if (format === 'hls' || format === 'm3u8') return 'hls';
        if (format === 'dash' || format === 'mpd') return 'dash';
        
        return 'unknown';
    } catch (error) {
        console.warn(`[ShakaPlayer] Invalid URL format: ${src}`);
        return 'unknown';
    }
};

const canPlayNatively = (mediaElement: HTMLMediaElement, format: 'hls' | 'dash'): boolean => {
    try {
        if (format === 'hls') {
            return !!mediaElement.canPlayType('application/vnd.apple.mpegurl');
        }
        if (format === 'dash') {
            return !!mediaElement.canPlayType('application/dash+xml');
        }
        return false;
    } catch (error) {
        return false;
    }
};

const createShakaPlayer = (
    mediaElement: HTMLMediaElement, 
    src: string, 
    format: StreamingFormat = 'auto',
    onPlayerReady?: (player: shaka.Player) => void,
    shakaConfig?: any,
    setShakaInstance?: (player: shaka.Player | null) => void
): shaka.Player | null => {
    if (!mediaElement) {
        throw new Error('[ShakaPlayer] Media element is required');
    }
    if (!src || typeof src !== 'string') {
        throw new Error('[ShakaPlayer] Valid source URL is required');
    }

    if (format === 'native') {
        mediaElement.src = src;
        setShakaInstance?.(null);
        return null;
    }

    let detectedFormat: 'hls' | 'dash' | 'unknown' = 'unknown';
    if (format === 'auto') {
        detectedFormat = detectFormat(src);
    } else if (format === 'hls' || format === 'dash') {
        detectedFormat = format;
    }

    if (detectedFormat !== 'unknown' && canPlayNatively(mediaElement, detectedFormat)) {
        mediaElement.src = src;
        setShakaInstance?.(null);
        return null;
    }

    ensurePolyfills();
    
    if (!shaka.Player.isBrowserSupported()) {
        throw new Error('[ShakaPlayer] Browser not supported by Shaka Player');
    }

    if (format === 'auto' && detectedFormat === 'unknown') {
        console.warn(`[ShakaPlayer] Could not detect format for ${src}, letting Shaka Player attempt to load`);
    }

    const player = new shaka.Player(mediaElement);
    setShakaInstance?.(player);
    
    if (shakaConfig) {
        try {
            player.configure(shakaConfig);
        } catch (error) {
            setShakaInstance?.(null);
            player.destroy();
            const errorMessage = error instanceof Error ? error.message : 'Unknown configuration error';
            throw new Error(`[ShakaPlayer] Invalid configuration: ${errorMessage}`);
        }
    }

    const errorHandler = (event: any) => {
        const error = event.detail;
        throw new Error(`[ShakaPlayer] Runtime error (${error.code}): ${error.message || 'Unknown error'} - ${src}`);
    };
    player.addEventListener('error', errorHandler);

    player.load(src)
        .then(() => {
            if (onPlayerReady) {
                try {
                    onPlayerReady(player);
                } catch (error) {
                    console.error('[ShakaPlayer] Error in onPlayerReady callback:', error);
                }
            }
        })
        .catch((error) => {
            setShakaInstance?.(null);
            player.destroy();
            const errorMessage = error instanceof Error ? error.message : 'Unknown load error';
            throw new Error(`[ShakaPlayer] Failed to load ${src}: ${errorMessage}`);
        });

    return player;
};

function useMediaShakaInternal(): readonly [unknown, (player: unknown) => void] {
    return useMediaOpaque('react-av:shaka-player') as readonly [unknown, (player: unknown) => void];
}

/**
 * Hook to access the Shaka Player instance from anywhere within the media context.
 * Returns the current Shaka Player instance or null if using native playback.
 */
export function useMediaShaka() {
    return useMediaOpaque('react-av:shaka-player')[0];
}

/**
 * The `ShakaVideo` component provides adaptive streaming video playback using Shaka Player.
 * It supports HLS and DASH formats with automatic format detection and native fallback.
 * 
 * @note The `ShakaVideo` component must be wrapped in a `Media.Container` component.
 */
const ShakaVideo = forwardRef<ShakaPlayerRef, ComponentProps<typeof Video> & ShakaPlayerProps>(
    function ShakaVideo({ src, children, format = 'auto', onPlayerReady, shakaConfig, ...props }, ref) {
        const videoRef = useRef<HTMLVideoElement>(null);
        const [shakaPlayer, setShakaInstance] = useMediaShakaInternal() as [shaka.Player | null, (player: shaka.Player | null) => void];

        const retry = useCallback(async () => {
            if (shakaPlayer && src) {
                try {
                    await shakaPlayer.load(src);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown retry error';
                    throw new Error(`[ShakaPlayer] Retry failed: ${errorMessage}`);
                }
            }
        }, [shakaPlayer, src]);

        useImperativeHandle(ref, () => ({
            player: shakaPlayer,
            retry
        }), [shakaPlayer, retry]);

        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;

            if (shakaPlayer) {
                setShakaInstance(null);
                shakaPlayer.destroy();
            }

            try {
                createShakaPlayer(video, src, format, onPlayerReady, shakaConfig, setShakaInstance);
            } catch (error) {
                setShakaInstance(null);
                throw error;
            }

            return () => {
                const currentPlayer = shakaPlayer;
                if (currentPlayer) {
                    setShakaInstance(null);
                    currentPlayer.destroy();
                }
            };
        }, [src, format, onPlayerReady, shakaConfig, setShakaInstance]);

        return (
            <Video {...props} ref={videoRef}>
                {children}
            </Video>
        );
    }
);

/**
 * The `ShakaAudio` component provides adaptive streaming audio playback using Shaka Player.
 * It supports HLS and DASH formats with automatic format detection and native fallback.
 */
const ShakaAudio = forwardRef<ShakaPlayerRef, ComponentProps<typeof Audio> & ShakaPlayerProps>(
    function ShakaAudio({ src, children, format = 'auto', onPlayerReady, shakaConfig, ...props }, ref) {
        const audioRef = useRef<HTMLAudioElement>(null);
        const [shakaPlayer, setShakaInstance] = useMediaShakaInternal() as [shaka.Player | null, (player: shaka.Player | null) => void];

        const retry = useCallback(async () => {
            if (shakaPlayer && src) {
                try {
                    await shakaPlayer.load(src);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown retry error';
                    throw new Error(`[ShakaPlayer] Retry failed: ${errorMessage}`);
                }
            }
        }, [shakaPlayer, src]);

        useImperativeHandle(ref, () => ({
            player: shakaPlayer,
            retry
        }), [shakaPlayer, retry]);

        useEffect(() => {
            const audio = audioRef.current;
            if (!audio) return;

            if (shakaPlayer) {
                setShakaInstance(null);
                shakaPlayer.destroy();
            }

            try {
                createShakaPlayer(audio, src, format, onPlayerReady, shakaConfig, setShakaInstance);
            } catch (error) {
                setShakaInstance(null);
                throw error;
            }

            return () => {
                const currentPlayer = shakaPlayer;
                if (currentPlayer) {
                    setShakaInstance(null);
                    currentPlayer.destroy();
                }
            };
        }, [src, format, onPlayerReady, shakaConfig, setShakaInstance]);

        return (
            <Audio {...props} ref={audioRef}>
                {children}
            </Audio>
        );
    }
);

export { ShakaVideo as Video, ShakaAudio as Audio };