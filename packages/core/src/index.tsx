import { atom, DefaultValue, RecoilRoot, selector, useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue, useSetRecoilState } from "recoil";
import React, { createContext, forwardRef, HTMLAttributes, HTMLProps, RefObject, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useResizeObserver from '@react-hook/resize-observer';

export enum MediaNetworkState {
    NETWORK_EMPTY = 0,
    NETWORK_IDLE = 1,
    NETWORK_LOADING = 2,
    NETWORK_NO_SOURCE = 3,
}

export enum MediaReadyState {
    HAVE_NOTHING = 0,
    HAVE_METADATA = 1,
    HAVE_CURRENT_DATA = 2,
    HAVE_FUTURE_DATA = 3,
    HAVE_ENOUGH_DATA = 4,
}

export const elementState_internal = atom({
    key: "elementState_internal",
    default: null as HTMLMediaElement | null
});

export const elementState = selector({
    key: "elementState",
    get: ({ get }) => {
        return get(elementState_internal);
    }
});

export function useMediaElement() {
    return useRecoilValue(elementState);
}

const isAudioOnlyState_internal = atom({
    key: "isAudioOnlyState_internal",
    default: false
});

export const isAudioOnlyState = selector({
    key: "isAudioOnlyState",
    get({ get }) {
        return get(isAudioOnlyState_internal);
    }
});

export function useMediaAudioOnly() {
    return useRecoilValue(isAudioOnlyState);
}

const isMutedState_internal = atom({
    key: "isMutedState_internal",
    default: false
});

export const isMutedState = selector({
    key: "isMutedState",
    get({ get }) {
        return get(isMutedState_internal);
    },
    set({ set, get }, value) {
        const element = get(elementState_internal);
        if (element) {
            if (value instanceof DefaultValue)
                return set(isMutedState_internal, element.muted);
            element.muted = value as boolean;
            return set(isMutedState_internal, element.muted);
        }
    }
});

export function useMediaMuted() {
    return useRecoilState(isMutedState);
}

const readyState_internal = atom({
    key: "readyState_internal",
    default: MediaReadyState.HAVE_NOTHING
});

export const readyState = selector({
    key: "readyState",
    get({ get }) {
        return get(readyState_internal);
    }
});

export function useMediaReadyState() {
    return useRecoilValue(readyState);
}

const networkState_internal = atom({
    key: "networkState_internal",
    default: MediaNetworkState.NETWORK_NO_SOURCE
});

export const networkState = selector({
    key: "networkState",
    get({ get }) {
        return get(networkState_internal);
    }
});

export function useMediaNetworkState() {
    return useRecoilValue(networkState);
}

const errorState_internal = atom({
    key: "errorState_internal",
    default: null as MediaError | null
});

export const errorState = selector({
    key: "errorState",
    get({ get }) {
        return get(errorState_internal);
    }
});

export function useMediaError() {
    return useRecoilValue(errorState);
}

const endedState_internal = atom({
    key: "endedState_internal",
    default: false
});

export const endedState = selector({
    key: "endedState",
    get({ get }) {
        return get(endedState_internal);
    }
});

export function useMediaEnded() {
    return useRecoilValue(endedState);
}

const bufferedState_internal = atom({
    key: "bufferedState_internal",
    default: null as TimeRanges | null
});

export const bufferedState = selector({
    key: "bufferedState",
    get({ get }) {
        return get(bufferedState_internal);
    }
});

export function useMediaBuffered() {
    return useRecoilValue(bufferedState);
}

const seekingState_internal = atom({
    key: "seekingState_internal",
    default: false
});

export const seekingState = selector({
    key: "seekingState",
    get({ get }) {
        return get(seekingState_internal);
    }
});

export function useMediaSeeking() {
    return useRecoilValue(seekingState);
}

const seekableState_internal = atom({
    key: "seekableState_internal",
    default: null as TimeRanges | null
});

export const seekableState = selector({
    key: "seekableState",
    get({ get }) {
        return get(seekableState_internal);
    }
});

export function useMediaSeekable() {
    return useRecoilValue(seekableState);
}

const playingState_internal = atom({
    key: "playingState_internal",
    default: false
});

export const playingState = selector({
    key: "playingState",
    get({ get }) {
        return get(playingState_internal);
    },
    set({ set, get }, value) {
        const element = get(elementState_internal);
        if (element) {
            if (value instanceof DefaultValue)
                return set(playingState_internal, !element.paused);
            if (value)
                element.play();
            else
                element.pause();
            return set(playingState_internal, !element.paused);
        }
    }
});

export function useMediaPlaying() {
    return useRecoilState(playingState);
}

const loopState_internal = atom({
    key: "loopState_internal",
    default: false
});

export const loopState = selector({
    key: "loopState",
    get({ get }) {
        return get(loopState_internal);
    },
    set({ set, get }, value) {
        const element = get(elementState_internal);
        if (element) {
            if (value instanceof DefaultValue)
                return set(loopState_internal, element.loop);
            element.loop = value;
            return set(loopState_internal, element.loop);
        }
    }
});

export function useMediaLoop() {
    return useRecoilState(loopState);
}

const volumeState_internal = atom({
    key: "volumeState_internal",
    default: 1
});

export const volumeState = selector({
    key: "volumeState",
    get({ get }) {
        return get(volumeState_internal);
    },
    set({ set, get }, value) {
        const element = get(elementState_internal);
        if (element) {
            if (value instanceof DefaultValue)
                return set(volumeState_internal, element.volume);
            element.volume = Math.min(Math.max(value, 0), 1);;
            return set(volumeState_internal, element.volume);
        }
    }
});

export function useMediaVolume() {
    return useRecoilState(volumeState);
}

const playbackRateState_internal = atom({
    key: "playbackRateState_internal",
    default: 1
});

export const playbackRateState = selector({
    key: "playbackRateState",
    get({ get }) {
        return get(playbackRateState_internal);
    },
    set({ set, get }, value) {
        const element = get(elementState_internal);
        if (element) {
            if (value instanceof DefaultValue)
                return set(playbackRateState_internal, element.playbackRate);
            element.playbackRate = value;
            return set(playbackRateState_internal, element.playbackRate);
        }
    }
});

export function useMediaPlaybackRate() {
    return useRecoilState(playbackRateState);
}

const durationState_internal = atom({
    key: "durationState_internal",
    default: 0
});

export const durationState = selector({
    key: "durationState",
    get({ get }) {
        return get(durationState_internal);
    }
});

export function useMediaDuration() {
    return useRecoilValue(durationState);
}

const currentTimeState_internal = atom({
    key: "currentTimeState_internal",
    default: 0
});

export const currentTimeState = selector({
    key: "currentTimeState",
    get({ get }) {
        return get(currentTimeState_internal);
    },
    set({ set, get }, value) {
        const element = get(elementState_internal);
        if (element) {
            if (value instanceof DefaultValue)
                return set(currentTimeState_internal, element.currentTime);
            element.currentTime = Math.min(Math.max(value, 0), element.duration);
            return set(currentTimeState_internal, element.currentTime);
        }
    }
});

export function useMediaCurrentTime() {
    return useRecoilState(currentTimeState);
}

export function useMediaCurrentTimeFine() {
    const element = useMediaElement();
    const setCurrentTimePlayback = useSetRecoilState(currentTimeState);
    const [currentTime, setCurrentTime] = useState<number>(0);
    useEffect(() => {
        let detached = false;
        if (!element) return;
        function tick() {
            if (detached || !element) return;
            setCurrentTime(element.currentTime);
            requestAnimationFrame(tick);
        }
        tick();
    }, [element]);
    return [currentTime, setCurrentTimePlayback] as const;
}

const fullscreenState_internal = atom({
    key: "fullscreenState_internal",
    default: false
});

export const fullscreenState = selector({
    key: "fullscreenState",
    get({ get }) {
        return get(fullscreenState_internal);
    },
    set({ set, get }, value) {
        const element = get(elementState_internal);
        if (element) {
            if (element.parentElement?.getAttribute('data-media-container') !== 'true') 
                throw new Error('Fullscreen only works if the media element is inside a media container');
            // @ts-ignore
            const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

            if (value instanceof DefaultValue)
                return set(fullscreenState_internal, fullscreenElement === element.parentElement);

            // @ts-ignore
            const enterFullscreen = element.parentElement?.requestFullscreen || element.parentElement?.webkitRequestFullscreen || element.parentElement?.mozRequestFullScreen || element.parentElement?.msRequestFullscreen;
            // @ts-ignore
            const exitFullscreen = document.exitFullscreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen;

            
            if (fullscreenElement === element.parentElement && !value) 
                exitFullscreen.call(document)?.catch(() => { });
            else if (value)
                enterFullscreen.call(element.parentElement)?.catch(() => { });
            
            return set(fullscreenState_internal, fullscreenElement === element.parentElement);
        }
    }
});

export function useMediaFullscreen() {
    return useRecoilState(fullscreenState);
}

const MediaInternal = ({ children }:  { children: React.ReactNode }) => {
    const element = useMediaElement();
    const [, setFullscreen] = useRecoilState(fullscreenState_internal);

    const updateContextRef = useRef<() => void>();

    const update = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        if (!element) return;
        const isAudioOnlyNew = element.tagName === 'AUDIO';
        if (get(isAudioOnlyState_internal) !== isAudioOnlyNew)
            set(isAudioOnlyState_internal, isAudioOnlyNew);
        const isMutedNew = element.muted;
        if (get(isMutedState_internal) !== isMutedNew)
            set(isMutedState_internal, isMutedNew);
        const readyStateNew = element.readyState;
        if (get(readyState_internal) !== readyStateNew)
            set(readyState_internal, readyStateNew);
        const networkStateNew = element.networkState;
        if (get(networkState_internal) !== networkStateNew)
            set(networkState_internal, networkStateNew);
        const errorNew = element.error;
        if (get(errorState_internal) !== errorNew)
            set(errorState_internal, errorNew);
        const endedNew = element.ended;
        if (get(endedState_internal) !== endedNew)
            set(endedState_internal, endedNew);
        const bufferedNew = element.buffered;
        if (get(bufferedState_internal) !== bufferedNew)
            set(bufferedState_internal, bufferedNew);
        const seekingNew = element.seeking;
        if (get(seekingState_internal) !== seekingNew)
            set(seekingState_internal, seekingNew);
        const seekableNew = element.seekable;
        if (get(seekableState_internal) !== seekableNew)
            set(seekableState_internal, seekableNew);
        const playingNew = !element.paused;
        if (get(playingState_internal) !== playingNew)
            set(playingState_internal, playingNew);
        const loopNew = element.loop;
        if (get(loopState_internal) !== loopNew)
            set(loopState_internal, loopNew);
        const volumeNew = element.volume;
        if (get(volumeState_internal) !== volumeNew)
            set(volumeState_internal, volumeNew);
        const playbackRateNew = element.playbackRate;
        if (get(playbackRateState_internal) !== playbackRateNew)
            set(playbackRateState_internal, playbackRateNew);
        const durationNew = element.duration;
        if (Number.isNaN(durationNew)) return;
        if (get(durationState_internal) !== durationNew)
            set(durationState_internal, durationNew);
        const currentTimeNew = element.currentTime;
        if (get(currentTimeState_internal) !== currentTimeNew)
            set(currentTimeState_internal, currentTimeNew);
    }, [element]);

    useEffect(() => {
        updateContextRef.current = function updateMediaContext() {
            update();
        }
    }, [element]);

    function updateFullScreenState() {
        // @ts-ignore
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        const fullscreenNew = fullscreenElement === element?.parentElement;
        setFullscreen(fullscreenNew);
    }

    useEffect(() => {
        if (!element) return;
        function updateMediaContext() {
            updateContextRef.current?.();
        }

        updateMediaContext();

        element.addEventListener('abort', updateMediaContext);
        element.addEventListener('canplay', updateMediaContext);
        element.addEventListener('canplaythrough', updateMediaContext);
        element.addEventListener('durationchange', updateMediaContext);
        element.addEventListener('emptied', updateMediaContext);
        element.addEventListener('ended', updateMediaContext);
        element.addEventListener('error', updateMediaContext);
        element.addEventListener('loadeddata', updateMediaContext);
        element.addEventListener('loadedmetadata', updateMediaContext);
        element.addEventListener('loadstart', updateMediaContext);
        element.addEventListener('pause', updateMediaContext);
        element.addEventListener('play', updateMediaContext);
        element.addEventListener('playing', updateMediaContext);
        element.addEventListener('progress', updateMediaContext);
        element.addEventListener('ratechange', updateMediaContext);
        element.addEventListener('resize', updateMediaContext);
        element.addEventListener('seeked', updateMediaContext);
        element.addEventListener('seeking', updateMediaContext);
        element.addEventListener('stalled', updateMediaContext);
        element.addEventListener('suspend', updateMediaContext);
        element.addEventListener('timeupdate', updateMediaContext);
        element.addEventListener('volumechange', updateMediaContext);
        element.addEventListener('waiting', updateMediaContext);
        document.addEventListener('fullscreenchange', updateFullScreenState);
        // vendor prefixes for fullscreenchange
        document.addEventListener('webkitfullscreenchange', updateFullScreenState);
        document.addEventListener('mozfullscreenchange', updateFullScreenState);
        document.addEventListener('MSFullscreenChange', updateFullScreenState);

        return () => {
            if (!element) return;
            element.removeEventListener('abort', updateMediaContext);
            element.removeEventListener('canplay', updateMediaContext);
            element.removeEventListener('canplaythrough', updateMediaContext);
            element.removeEventListener('durationchange', updateMediaContext);
            element.removeEventListener('emptied', updateMediaContext);
            element.removeEventListener('ended', updateMediaContext);
            element.removeEventListener('error', updateMediaContext);
            element.removeEventListener('loadeddata', updateMediaContext);
            element.removeEventListener('loadedmetadata', updateMediaContext);
            element.removeEventListener('loadstart', updateMediaContext);
            element.removeEventListener('pause', updateMediaContext);
            element.removeEventListener('play', updateMediaContext);
            element.removeEventListener('playing', updateMediaContext);
            element.removeEventListener('progress', updateMediaContext);
            element.removeEventListener('ratechange', updateMediaContext);
            element.removeEventListener('resize', updateMediaContext);
            element.removeEventListener('seeked', updateMediaContext);
            element.removeEventListener('seeking', updateMediaContext);
            element.removeEventListener('stalled', updateMediaContext);
            element.removeEventListener('suspend', updateMediaContext);
            element.removeEventListener('timeupdate', updateMediaContext);
            element.removeEventListener('volumechange', updateMediaContext);
            element.removeEventListener('waiting', updateMediaContext);
            document.removeEventListener('fullscreenchange', updateFullScreenState);
            // vendor prefixes for fullscreenchange
            document.removeEventListener('webkitfullscreenchange', updateFullScreenState);
            document.removeEventListener('mozfullscreenchange', updateFullScreenState);
            document.removeEventListener('MSFullscreenChange', updateFullScreenState);
        }
    }, [element]);

    return <>
        {children}
    </>
}

export function Root({ children, ...props }: React.ComponentProps<typeof MediaInternal>) {
    return <RecoilRoot>
        <MediaInternal {...props}>
            {children}
        </MediaInternal>
    </RecoilRoot>
}

export const Video = forwardRef<HTMLVideoElement, Omit<HTMLProps<HTMLVideoElement>, "children">>(function Video({ ...props }, f_ref) {
    const ref = useRef<HTMLVideoElement>(null);
    const [, setElement] = useRecoilState(elementState_internal);

    useEffect(() => {
        if (ref.current?.parentElement?.getAttribute('data-media-container') !== 'true') 
            throw new Error('Video element must be wrapped in a <Media.Container />');
        setElement(ref.current);
    }, [setElement]);

    return <video {...props} ref={current => {
        // @ts-ignore
        ref.current = current;
        if (typeof f_ref === 'function') f_ref(current);
        // @ts-ignore
        else if (f_ref) f_ref.current = current;
    }} />;
});

export const Audio = forwardRef<HTMLAudioElement, Omit<HTMLProps<HTMLAudioElement>, "children">>(function Audio({ ...props }, f_ref) {
    const ref = useRef<HTMLAudioElement>(null);
    const [, setElement] = useRecoilState(elementState_internal);

    useEffect(() => {
        setElement(ref.current);
    }, [setElement]);

    return <audio {...props} ref={current => {
        // @ts-ignore
        ref.current = current;
        if (typeof f_ref === 'function') f_ref(current);
        // @ts-ignore
        else if (f_ref) f_ref.current = current;
    }} />;
});

export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Container({ children, style, ...props }, ref) {
    return <div {...props} style={{ position: 'relative', ...(style || {}) }} ref={ref} data-media-container="true">
        {children}
    </div>
});

export function useSize(target: RefObject<HTMLElement>) {
    const [size, setSize] = useState<DOMRect>()
  
    useLayoutEffect(() => {
      setSize(target.current?.getBoundingClientRect())
    }, [target])

    useResizeObserver(target, (entry) => setSize(entry.contentRect))
    return size;
}

export const ViewportHoverContext = createContext<boolean | undefined>(undefined);

export function useMediaViewportHover() {
    return useContext(ViewportHoverContext);
}

export const Viewport = forwardRef<HTMLDivElement, Omit<HTMLAttributes<HTMLDivElement>, "onMouseMove"> & { hoverInactiveTimeout?: number, inactiveClassName?: string }>(function Viewport({ children, hoverInactiveTimeout = 2000, className, inactiveClassName, ...props }, ref) {
    const element = useMediaElement();
    const [ hover, setHover ] = useState(false);
    const [ hoverTimeout, setHoverTimeout ] = useState<any>();

    function handleMouseMove() {
        setHover(true);
        hoverTimeout && clearTimeout(hoverTimeout);
        const hoverTimeoutNew = setTimeout(() => setHover(false), hoverInactiveTimeout);
        setHoverTimeout(hoverTimeoutNew);
    }

    function handleMouseLeave() {
        setHover(false);
    }

    const overlay = <ViewportHoverContext.Provider value={hover}>
        <div 
            {...props} 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave} 
            ref={ref}
            className={`${className || ""} ${hover ? "" : inactiveClassName || ""}`.trim() || undefined}
        >
            {children}
        </div>
    </ViewportHoverContext.Provider>;

    if (element?.parentElement)
        return createPortal(overlay, element.parentElement);

    return overlay;
});
