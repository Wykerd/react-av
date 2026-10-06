import React, { forwardRef, useEffect, useRef, useImperativeHandle, useCallback } from "react";
import type shaka from 'shaka-player/dist/shaka-player.compiled';
import { Video, Audio, useMediaOpaque, VideoProps, AudioProps } from "@react-av/core";

export interface ShakaPlayerRef {
    player: unknown;
    retry: () => Promise<void>;
}

export type StreamingFormat = 'auto' | 'hls' | 'dash' | 'native';

export interface ShakaPlayerProps {
    src: string;
    format?: StreamingFormat;
    onPlayerReady?: (player: unknown) => void;
    onPlayerError?: (error: unknown) => void;
    shakaConfig?: any;
}

let polyfillsInstalled = false;

function detectFormat(src: string): 'hls' | 'dash' | 'unknown' {
    try {
        const url = new URL(src, window.location.href);
        const pathname = url.pathname.toLowerCase();
        const format = url.searchParams.get('format')?.toLowerCase();
        if (pathname.endsWith('.m3u8') || pathname.includes('/hls/') || format === 'hls' || format === 'm3u8') return 'hls';
        if (pathname.endsWith('.mpd') || pathname.includes('/dash/') || format === 'dash' || format === 'mpd') return 'dash';
    } catch {
        return 'unknown';
    }
    return 'unknown';
}

function canPlayNatively(element: HTMLMediaElement, src: string, format: StreamingFormat) {
    if (format === 'native') return true;
    const detected = format === 'auto' ? detectFormat(src) : format;
    if (detected === 'hls') return Boolean(element.canPlayType('application/vnd.apple.mpegurl'));
    if (detected === 'dash') return Boolean(element.canPlayType('application/dash+xml'));
    const nativeTypes: Record<string, string> = {
        mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
        mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg',
    };
    const extension = new URL(src, element.ownerDocument.baseURI).pathname.split('.').pop()?.toLowerCase();
    const type = extension && nativeTypes[extension];
    return Boolean(type && element.canPlayType(type));
}

export function useMediaShaka() {
    return useMediaOpaque('react-av:shaka-player')[0];
}

export function useMediaShakaError() {
    return useMediaOpaque('react-av:shaka-error')[0];
}

function useShakaPlayer(
    elementRef: React.RefObject<HTMLMediaElement | null>,
    { src, format = 'auto', onPlayerReady, onPlayerError, shakaConfig }: ShakaPlayerProps,
    ref: React.ForwardedRef<ShakaPlayerRef>,
) {
    const [instance, setInstance] = useMediaOpaque('react-av:shaka-player');
    const [, setError] = useMediaOpaque('react-av:shaka-error');
    const teardown = useRef<Promise<void>>(Promise.resolve());
    const callbacks = useRef({ onPlayerReady, onPlayerError });
    useEffect(() => { callbacks.current = { onPlayerReady, onPlayerError }; });

    const reportError = useCallback((error: unknown) => {
        setError(error);
        callbacks.current.onPlayerError?.(error);
    }, [setError]);

    const retry = useCallback(async () => {
        setError(null);
        try {
            if (instance) await (instance as shaka.Player).load(src);
            else elementRef.current?.load();
        } catch (error) {
            reportError(error);
            throw error;
        }
    }, [instance, src, elementRef, reportError, setError]);

    useImperativeHandle(ref, () => ({ player: instance, retry }), [instance, retry]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;
        let active = true;
        let player: shaka.Player | null = null;
        let native = false;
        setError(null);
        setInstance(null);

        function handleError(event: Event) {
            if (active) reportError((event as CustomEvent).detail);
        }
        async function load() {
            await teardown.current;
            if (!active) return;
            try {
                if (!src) throw new Error('[ShakaPlayer] Valid source URL is required');
                if (canPlayNatively(element!, src, format)) {
                    native = true;
                    element!.src = src;
                    return;
                }
                const { default: shaka } = await import('shaka-player/dist/shaka-player.compiled');
                if (!active) return;
                if (!polyfillsInstalled) {
                    shaka.polyfill.installAll();
                    polyfillsInstalled = true;
                }
                if (!shaka.Player.isBrowserSupported())
                    throw new Error('[ShakaPlayer] Browser not supported by Shaka Player');
                player = new shaka.Player();
                player.addEventListener('error', handleError);
                if (shakaConfig && !player.configure(shakaConfig))
                    throw new Error('[ShakaPlayer] Invalid configuration');
                await player.attach(element!);
                if (!active) return;
                setInstance(player);
                await player.load(src);
                if (active) callbacks.current.onPlayerReady?.(player);
            } catch (error) {
                if (active) reportError(error);
            }
        }
        void load();
        return () => {
            active = false;
            setInstance(null);
            if (player) {
                player.removeEventListener('error', handleError);
                teardown.current = player.destroy().catch(reportError);
            } else if (native) {
                element.removeAttribute('src');
                element.load();
            }
        };
    }, [src, format, shakaConfig, elementRef, setInstance, setError, reportError]);
}

type ShakaVideoProps = VideoProps & ShakaPlayerProps;
type ShakaAudioProps = AudioProps & ShakaPlayerProps;

const ShakaVideo = forwardRef<ShakaPlayerRef, ShakaVideoProps>(
    function ShakaVideo({ src, children, format, onPlayerReady, onPlayerError, shakaConfig, ...props }, ref) {
        const videoRef = useRef<HTMLVideoElement>(null);
        useShakaPlayer(videoRef, { src, format, onPlayerReady, onPlayerError, shakaConfig }, ref);
        return <Video {...props} ref={videoRef}>{children}</Video>;
    }
);

const ShakaAudio = forwardRef<ShakaPlayerRef, ShakaAudioProps>(
    function ShakaAudio({ src, children, format, onPlayerReady, onPlayerError, shakaConfig, ...props }, ref) {
        const audioRef = useRef<HTMLAudioElement>(null);
        useShakaPlayer(audioRef, { src, format, onPlayerReady, onPlayerError, shakaConfig }, ref);
        return <Audio {...props} ref={audioRef}>{children}</Audio>;
    }
);

export { ShakaVideo as Video, ShakaAudio as Audio };
