import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

const MediaStoreContext = createContext<MediaStore | null>(null);

export enum MediaReadyState {
    HAVE_NOTHING = 0,
    HAVE_METADATA = 1,
    HAVE_CURRENT_DATA = 2,
    HAVE_FUTURE_DATA = 3,
    HAVE_ENOUGH_DATA = 4,
}

export enum MediaNetworkState {
    NETWORK_EMPTY = 0,
    NETWORK_IDLE = 1,
    NETWORK_LOADING = 2,
    NETWORK_NO_SOURCE = 3,
}

export type StoreListener = () => void;
export type StoreListenerUnsubscribe = () => void;

export interface StateStore<T> {
    getState: () => T;
    setState: (state: T) => void;
    subscribe: (callback: StoreListener) => StoreListenerUnsubscribe;
}

export function createStateStore<T>(initialState: T): StateStore<T> {
    let state = initialState;
    const listeners = new Set<StoreListener>();

    function getState() {
        return state;
    }

    function setState(newState: T) {
        if (Object.is(state, newState)) return;
        state = newState;
        listeners.forEach((listener) => listener());
    }

    function subscribe(callback: StoreListener) {
        listeners.add(callback);
        return () => {
            listeners.delete(callback);
        };
    }

    return {
        getState,
        setState,
        subscribe,
    };
}

export interface MediaStore {
    mediaElement: StateStore<HTMLMediaElement | null>;
    audioOnly: StateStore<boolean>;
    muted: StateStore<boolean>;
    readyState: StateStore<MediaReadyState>;
    networkState: StateStore<MediaNetworkState>;
    error: StateStore<MediaError | null>;
    ended: StateStore<boolean>;
    buffered: StateStore<TimeRanges | null>;
    seeking: StateStore<boolean>;
    seekable: StateStore<TimeRanges | null>;
    playing: StateStore<boolean>;
    loop: StateStore<boolean>;
    volume: StateStore<number>;
    playbackRate: StateStore<number>;
    duration: StateStore<number>;
    currentTime: StateStore<number>;
    fullscreen: StateStore<boolean>;
    opaque: (key: string) => StateStore<unknown>;
}

function timeRangesCompare(a: TimeRanges, b: TimeRanges) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a.start(i) !== b.start(i) || a.end(i) !== b.end(i)) return false;
    }
    return true;
}

function createMutedStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<boolean> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('volumechange', handler);
        
        cleanup = () => {
            element.removeEventListener('volumechange', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            return mediaElement.getState()?.muted ?? false;
        },
        setState(muted) {
            const element = mediaElement.getState();
            if (!element) return;
            element.muted = muted;
            listeners.forEach((listener) => listener());
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaReadyStateStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<MediaReadyState> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('abort', handler);
        element.addEventListener('canplay', handler);
        element.addEventListener('canplaythrough', handler);
        element.addEventListener('emptied', handler);
        element.addEventListener('error', handler);
        element.addEventListener('loadeddata', handler);
        element.addEventListener('loadedmetadata', handler);
        element.addEventListener('loadstart', handler);
        element.addEventListener('stalled', handler);
        element.addEventListener('suspend', handler);
        element.addEventListener('waiting', handler);
        element.addEventListener('seeking', handler);
        element.addEventListener('seeked', handler);
        element.addEventListener('ended', handler);
        
        cleanup = () => {
            element.removeEventListener('abort', handler);
            element.removeEventListener('canplay', handler);
            element.removeEventListener('canplaythrough', handler);
            element.removeEventListener('emptied', handler);
            element.removeEventListener('error', handler);
            element.removeEventListener('loadeddata', handler);
            element.removeEventListener('loadedmetadata', handler);
            element.removeEventListener('loadstart', handler);
            element.removeEventListener('stalled', handler);
            element.removeEventListener('suspend', handler);
            element.removeEventListener('waiting', handler);
            element.removeEventListener('seeking', handler);
            element.removeEventListener('seeked', handler);
            element.removeEventListener('ended', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return MediaReadyState.HAVE_NOTHING;
            return element.readyState;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaNetworkStateStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<MediaNetworkState> {
    const listeners = new Set<StoreListener>();
    let lastState: MediaNetworkState | null = null;
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            if (!element) return;
            if (element.networkState === lastState) return;
            listeners.forEach((listener) => listener());
            lastState = element.networkState;
        };
        element.addEventListener('loadstart', handler);
        element.addEventListener('suspend', handler);
        element.addEventListener('abort', handler);
        element.addEventListener('error', handler);
        element.addEventListener('emptied', handler);
        element.addEventListener('stalled', handler);
        element.addEventListener('loadedmetadata', handler);
        element.addEventListener('loadeddata', handler);
        element.addEventListener('canplay', handler);
        element.addEventListener('canplaythrough', handler);
        element.addEventListener('waiting', handler);
        element.addEventListener('seeking', handler);
        element.addEventListener('seeked', handler);
        element.addEventListener('ended', handler);
        element.addEventListener('progress', handler);
        
        cleanup = () => {
            element.removeEventListener('loadstart', handler);
            element.removeEventListener('suspend', handler);
            element.removeEventListener('abort', handler);
            element.removeEventListener('error', handler);
            element.removeEventListener('emptied', handler);
            element.removeEventListener('stalled', handler);
            element.removeEventListener('loadedmetadata', handler);
            element.removeEventListener('loadeddata', handler);
            element.removeEventListener('canplay', handler);
            element.removeEventListener('canplaythrough', handler);
            element.removeEventListener('waiting', handler);
            element.removeEventListener('seeking', handler);
            element.removeEventListener('seeked', handler);
            element.removeEventListener('ended', handler);
            element.removeEventListener('progress', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return MediaNetworkState.NETWORK_EMPTY;
            return element.networkState;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaErrorStateStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<MediaError | null> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('error', handler);
        element.addEventListener('emptied', handler);
        element.addEventListener('loadstart', handler);
        
        cleanup = () => {
            element.removeEventListener('error', handler);
            element.removeEventListener('emptied', handler);
            element.removeEventListener('loadstart', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return null;
            return element.error;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaEndedStateStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<boolean> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('ended', handler);
        element.addEventListener('seeked', handler);
        element.addEventListener('play', handler);
        element.addEventListener('durationchange', handler);
        
        cleanup = () => {
            element.removeEventListener('ended', handler);
            element.removeEventListener('seeked', handler);
            element.removeEventListener('play', handler);
            element.removeEventListener('durationchange', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return false;
            return element.ended;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaBufferedStateStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<TimeRanges | null> {
    const listeners = new Set<StoreListener>();
    let lastRanges: TimeRanges | null = null;
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        lastRanges = element?.buffered ?? null;
        listeners.forEach(listener => listener());
        if (!element) return;
        function handler () {
            if (!element?.buffered) return;
            if (lastRanges && timeRangesCompare(element.buffered, lastRanges)) return;
            lastRanges = element?.buffered ?? null;
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('progress', handler);
        element.addEventListener('loadedmetadata', handler);
        element.addEventListener('emptied', handler);
        
        cleanup = () => {
            element.removeEventListener('progress', handler);
            element.removeEventListener('loadedmetadata', handler);
            element.removeEventListener('emptied', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return null;
            return lastRanges;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

export function createMediaSeekingStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<boolean> {
    const listeners = new Set<StoreListener>();
    let lastSeeking: boolean = false;
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            if (element?.seeking === lastSeeking) return;
            listeners.forEach((listener) => listener());
            lastSeeking = element?.seeking ?? false;
        };
        element.addEventListener('seeking', handler);
        element.addEventListener('seeked', handler);
        
        cleanup = () => {
            element.removeEventListener('seeking', handler);
            element.removeEventListener('seeked', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return false;
            return element.seeking;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

export function createMediaSeekableStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<TimeRanges | null> {
    const listeners = new Set<StoreListener>();
    let lastRanges: TimeRanges | null = null;
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        lastRanges = element?.seekable ?? null;
        listeners.forEach(listener => listener());
        if (!element) return;
        function handler () {
            if (!element?.seekable) return;
            if (lastRanges && timeRangesCompare(element.seekable, lastRanges)) return;
            lastRanges = element?.seekable ?? null;
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('seeking', handler);
        element.addEventListener('seeked', handler);
        element.addEventListener('progress', handler);
        element.addEventListener('canplay', handler);
        element.addEventListener('canplaythrough', handler);
        element.addEventListener('loadedmetadata', handler);
        element.addEventListener('emptied', handler);
        
        cleanup = () => {
            element.removeEventListener('seeking', handler);
            element.removeEventListener('seeked', handler);
            element.removeEventListener('progress', handler);
            element.removeEventListener('canplay', handler);
            element.removeEventListener('canplaythrough', handler);
            element.removeEventListener('loadedmetadata', handler);
            element.removeEventListener('emptied', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return null;
            return lastRanges;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaPlayingStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<boolean> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('play', handler);
        element.addEventListener('pause', handler);
        element.addEventListener('ended', handler);
        element.addEventListener('emptied', handler);
        element.addEventListener('error', handler);

        cleanup = () => {
            element.removeEventListener('play', handler);
            element.removeEventListener('pause', handler);
            element.removeEventListener('ended', handler);
            element.removeEventListener('emptied', handler);
            element.removeEventListener('error', handler);
        };
        handler();
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return false;
            return !element.paused;
        },
        setState(playing) {
            const element = mediaElement.getState();
            if (!element) return;
            if (playing && element.paused) {
                try {
                    element.play()?.catch(() => {
                        listeners.forEach((listener) => listener());
                    });
                } catch {
                    listeners.forEach((listener) => listener());
                }
            }
            if (!playing && !element.paused) element.pause();
            listeners.forEach((listener) => listener());
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaLoopStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<boolean> {
    const listeners = new Set<StoreListener>();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return false;
            return element.loop;
        },
        setState(loop) {
            const element = mediaElement.getState();
            if (!element) return;
            element.loop = loop;
            listeners.forEach((listener) => listener());
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaVolumeStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<number> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('volumechange', handler);

        cleanup = () => {
            element.removeEventListener('volumechange', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return 1;
            return element.volume;
        },
        setState(volume) {
            const element = mediaElement.getState();
            if (!element) return;
            element.volume = Math.max(0, Math.min(1, volume));
            listeners.forEach((listener) => listener());
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaPlaybackRateStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<number> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('ratechange', handler);
        
        cleanup = () => {
            element.removeEventListener('ratechange', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return 1;
            return element.playbackRate;
        },
        setState(rate) {
            const element = mediaElement.getState();
            if (!element) return;
            element.playbackRate = rate;
            listeners.forEach((listener) => listener());
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaDurationStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<number> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};

    function detectChanges() {
        cleanup();

        const element = mediaElement.getState();
        if (!element) return;
        function handler () {
            listeners.forEach((listener) => listener());
        };
        element.addEventListener('durationchange', handler);
        
        cleanup = () => {
            element.removeEventListener('durationchange', handler);
        };
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            const element = mediaElement.getState();
            if (!element) return 0;
            if (Number.isNaN(element.duration)) return 0;
            return element.duration;
        },
        setState() {
            // Do nothing
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            }
        },
    }
}

function createMediaCurrentTimeStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<number> {
    const listeners = new Set<StoreListener>();
    let currentTime = 0;
    let cleanup: StoreListenerUnsubscribe = () => {};

    function update() {
        const time = mediaElement.getState()?.currentTime ?? 0;
        const nextTime = Number.isFinite(time) ? time : 0;
        if (nextTime === currentTime) return;
        currentTime = nextTime;
        listeners.forEach(listener => listener());
    }

    function detectChanges() {
        cleanup();
        update();
        const element = mediaElement.getState();
        if (!element) return;
        const events = ['timeupdate', 'seeking', 'seeked', 'loadedmetadata', 'emptied'];
        events.forEach(event => element.addEventListener(event, update));
        cleanup = () => events.forEach(event => element.removeEventListener(event, update));
    }

    mediaElement.subscribe(detectChanges);
    detectChanges();

    return {
        getState() {
            return currentTime;
        },
        setState(time) {
            const element = mediaElement.getState();
            if (!element || !Number.isFinite(time) || !Number.isFinite(element.duration)) return;
            element.currentTime = Math.min(Math.max(time, 0), element.duration);
            update();
        },
        subscribe(callback) {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
    };
}

type FullscreenDocument = Document & {
    webkitFullscreenElement?: Element;
    webkitFullscreenEnabled?: boolean;
    webkitExitFullscreen?: () => Promise<void> | void;
    webkitCancelFullScreen?: () => void;
    mozFullScreenElement?: Element;
    mozCancelFullScreen?: () => void;
    msFullscreenElement?: Element;
    msExitFullscreen?: () => void;
};

type FullscreenContainer = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    mozRequestFullScreen?: () => void;
    msRequestFullscreen?: () => void;
};

type FullscreenMedia = HTMLMediaElement & {
    webkitDisplayingFullscreen?: boolean;
    webkitSupportsFullscreen?: boolean;
    webkitEnterFullscreen?: () => void;
    webkitExitFullscreen?: () => void;
};

function getFullscreenElement(document: FullscreenDocument) {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
}

function getEnterFullscreen(container: FullscreenContainer) {
    const document = container.ownerDocument as FullscreenDocument;
    if (document.fullscreenEnabled !== false && container.requestFullscreen) return container.requestFullscreen;
    if (document.webkitFullscreenEnabled !== false && container.webkitRequestFullscreen) return container.webkitRequestFullscreen;
    return container.mozRequestFullScreen || container.msRequestFullscreen;
}

function supportsFullscreen(element: FullscreenMedia | null) {
    if (!element?.parentElement) return false;
    if (getEnterFullscreen(element.parentElement)) return true;
    return element.nodeName === 'VIDEO' && typeof element.webkitEnterFullscreen === 'function' && element.webkitSupportsFullscreen !== false;
}

function createMediaFullscreenStore(mediaElement: StateStore<HTMLMediaElement | null>): StateStore<boolean> {
    const listeners = new Set<StoreListener>();
    let cleanup: StoreListenerUnsubscribe = () => {};
    let unsubscribeElement: StoreListenerUnsubscribe = () => {};

    function notify() {
        listeners.forEach(listener => listener());
    }

    function detectChanges() {
        cleanup();
        const element = mediaElement.getState();
        if (!element) return;
        const document = element.ownerDocument;
        const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        events.forEach(event => document.addEventListener(event, notify));
        element.addEventListener('webkitbeginfullscreen', notify);
        element.addEventListener('webkitendfullscreen', notify);
        cleanup = () => {
            events.forEach(event => document.removeEventListener(event, notify));
            element.removeEventListener('webkitbeginfullscreen', notify);
            element.removeEventListener('webkitendfullscreen', notify);
        };
        notify();
    }

    return {
        getState() {
            const element = mediaElement.getState() as FullscreenMedia | null;
            if (!element) return false;
            return Boolean(element.webkitDisplayingFullscreen || (element.parentElement && getFullscreenElement(element.ownerDocument) === element.parentElement));
        },
        setState(fullscreen) {
            const element = mediaElement.getState() as FullscreenMedia | null;
            if (!element) return;
            const container = element.parentElement;
            if (container?.getAttribute('data-media-container') !== 'true')
                throw new Error('Fullscreen only works if the media element is inside a media container');
            const document = element.ownerDocument as FullscreenDocument;
            const fullscreenElement = getFullscreenElement(document);
            try {
                if (fullscreen) {
                    const enterFullscreen = getEnterFullscreen(container);
                    if (enterFullscreen) {
                        enterFullscreen.call(container)?.catch(notify);
                    } else if (supportsFullscreen(element)) {
                        element.webkitEnterFullscreen?.();
                    }
                } else if (element.webkitDisplayingFullscreen) {
                    element.webkitExitFullscreen?.();
                } else if (fullscreenElement === container) {
                    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen;
                    exitFullscreen?.call(document)?.catch(notify);
                }
            } catch {
                notify();
            }
        },
        subscribe(callback) {
            listeners.add(callback);
            if (listeners.size === 1) {
                unsubscribeElement = mediaElement.subscribe(detectChanges);
                detectChanges();
            }
            return () => {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    unsubscribeElement();
                    cleanup();
                }
            };
        },
    };
}

export function createMediaStore(): MediaStore {
    const mediaElement = createStateStore<HTMLMediaElement | null>(null);

    const opaqueStores = new Map<string, StateStore<unknown>>();

    return {
        mediaElement,
        audioOnly: {
            getState() {
                return mediaElement.getState()?.tagName === 'AUDIO';
            },
            setState() {
                // Do nothing
            },
            subscribe(callback) {
                return mediaElement.subscribe(callback);
            },
        },
        muted: createMutedStore(mediaElement),
        readyState: createMediaReadyStateStore(mediaElement),
        networkState: createMediaNetworkStateStore(mediaElement),
        error: createMediaErrorStateStore(mediaElement),
        ended: createMediaEndedStateStore(mediaElement),
        buffered: createMediaBufferedStateStore(mediaElement),
        seeking: createMediaSeekingStore(mediaElement),
        seekable: createMediaSeekableStore(mediaElement),
        playing: createMediaPlayingStore(mediaElement),
        loop: createMediaLoopStore(mediaElement),
        volume: createMediaVolumeStore(mediaElement),
        playbackRate: createMediaPlaybackRateStore(mediaElement),
        duration: createMediaDurationStore(mediaElement),
        currentTime: createMediaCurrentTimeStore(mediaElement),
        fullscreen: createMediaFullscreenStore(mediaElement),
        opaque: (key: string) => {
            if (opaqueStores.has(key)) 
                return opaqueStores.get(key)!;

            const store = createStateStore<unknown>(null);
            opaqueStores.set(key, store);

            return store;
        }
    }
}

export function useMediaStore() {
    const store = useContext(MediaStoreContext);
    if (!store) {
        throw new Error('useMediaStore must be used within a MediaStoreProvider');
    }
    return store;
}

export function MediaStoreProvider({ children }: { children: React.ReactNode }) {
    const store = useMemo(() => createMediaStore(), []);
    return <MediaStoreContext.Provider value={store}>{children}</MediaStoreContext.Provider>;
}

export function useStateStoreValue<T>(store: StateStore<T>): T {
    return useSyncExternalStore(store.subscribe, store.getState);
}

export function useStateStore<T>(store: StateStore<T>): readonly [T, (value: T) => void] {
    return [useStateStoreValue(store), store.setState] as const;
}

export function useMediaOpaque(key: string) {
    const store = useMediaStore();

    return useStateStore(store.opaque(key));
}

export function useMediaElement() {
    const store = useMediaStore();
    return useStateStoreValue(store.mediaElement);
}

export function useMediaElementState() {
    const store = useMediaStore();
    return useStateStore(store.mediaElement);
}

export function useMediaAudioOnly() {
    const store = useMediaStore();
    return useStateStoreValue(store.audioOnly);
}

export function useMediaMuted() {
    const store = useMediaStore();
    return useStateStore(store.muted);
}

export function useMediaReadyState() {
    const store = useMediaStore();
    return useStateStoreValue(store.readyState);
}

export function useMediaNetworkState() {
    const store = useMediaStore();
    return useStateStoreValue(store.networkState);
}

export function useMediaError() {
    const store = useMediaStore();
    return useStateStoreValue(store.error);
}

export function useMediaEnded() {
    const store = useMediaStore();
    return useStateStoreValue(store.ended);
}

export function useMediaBuffered() {
    const store = useMediaStore();
    return useStateStoreValue(store.buffered);
}

export function useMediaSeeking() {
    const store = useMediaStore();
    return useStateStoreValue(store.seeking);
}

export function useMediaSeekable() {
    const store = useMediaStore();
    return useStateStoreValue(store.seekable);
}

export function useMediaPlaying() {
    const store = useMediaStore();
    return useStateStore(store.playing);
}

export function useMediaLoop() {
    const store = useMediaStore();
    return useStateStore(store.loop);
}

export function useMediaVolume() {
    const store = useMediaStore();
    return useStateStore(store.volume);
}

export function useMediaPlaybackRate() {
    const store = useMediaStore();
    return useStateStore(store.playbackRate);
}

export function useMediaDuration() {
    const store = useMediaStore();
    return useStateStoreValue(store.duration);
}

export function useMediaCurrentTime() {
    const store = useMediaStore();
    return useStateStore(store.currentTime);
}

export function useMediaCurrentTimeFine() {
    const store = useMediaStore();
    const element = useMediaElement();
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (!element) {
            setCurrentTime(0);
            return;
        }
        let handle: number | undefined;
        const document = element.ownerDocument;
        function update() {
            if (element && Number.isFinite(element.currentTime)) setCurrentTime(element.currentTime);
        }
        function stop() {
            if (handle !== undefined) cancelAnimationFrame(handle);
            handle = undefined;
            update();
        }
        function tick() {
            handle = undefined;
            update();
            if (!element?.paused && !element?.ended && !document.hidden) handle = requestAnimationFrame(tick);
        }
        function start() {
            update();
            if (handle === undefined && !element?.paused && !element?.ended && !document.hidden)
                handle = requestAnimationFrame(tick);
        }
        function visibilityChanged() {
            if (document.hidden) stop();
            else start();
        }
        element.addEventListener('playing', start);
        element.addEventListener('pause', stop);
        element.addEventListener('ended', stop);
        element.addEventListener('waiting', stop);
        element.addEventListener('emptied', stop);
        element.addEventListener('timeupdate', update);
        element.addEventListener('seeked', update);
        document.addEventListener('visibilitychange', visibilityChanged);
        start();
        return () => {
            if (handle !== undefined) cancelAnimationFrame(handle);
            element.removeEventListener('playing', start);
            element.removeEventListener('pause', stop);
            element.removeEventListener('ended', stop);
            element.removeEventListener('waiting', stop);
            element.removeEventListener('emptied', stop);
            element.removeEventListener('timeupdate', update);
            element.removeEventListener('seeked', update);
            document.removeEventListener('visibilitychange', visibilityChanged);
        };
    }, [element]);

    return [currentTime, store.currentTime.setState] as const;
}

export function useMediaFullscreenSupported() {
    const element = useMediaElement();
    useMediaReadyState();
    return supportsFullscreen(element);
}

export function useMediaFullscreen() {
    const store = useMediaStore();
    return useStateStore(store.fullscreen);
}
