import React, { ComponentPropsWithoutRef, createContext, forwardRef, RefAttributes, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MediaReadyState, MediaStoreProvider, useMediaElement, useMediaElementState, useMediaError, useMediaReadyState } from "./state";

const LoadingContext = createContext({ active: true, activate: () => {} });

export type RootProps = {
    children: React.ReactNode;
    loading?: 'eager' | 'lazy';
};

export type MediaLoadingState = 'deferred' | 'loading' | 'ready' | 'error';

export function useMediaLoadingState(): MediaLoadingState {
    const { active } = useContext(LoadingContext);
    const readyState = useMediaReadyState();
    const error = useMediaError();
    if (error) return 'error';
    if (!active) return 'deferred';
    if (readyState >= MediaReadyState.HAVE_CURRENT_DATA) return 'ready';
    return 'loading';
}

/**
 * The `Media.Root` component is the root of the React AV component tree. It provides the context for all other components to work.
 */
export function Root({ children, loading = 'eager' } : RootProps) {
    const [activated, setActivated] = useState(loading === 'eager');
    const activate = useCallback(() => setActivated(true), []);
    const active = loading === 'eager' || activated;
    const policy = useMemo(() => ({ active, activate }), [active, activate]);

    useEffect(() => {
        if (loading === 'eager') activate();
    }, [loading, activate]);

    return <MediaStoreProvider>
        <LoadingContext.Provider value={policy}>{children}</LoadingContext.Provider>
    </MediaStoreProvider>
}

export type VideoProps = ComponentPropsWithoutRef<"video">;

/**
 * The `Media.Video` component is a wrapper around the HTML5 `<video>` element. It accepts all props that a `video` element accepts.
 * 
 * @note The `Media.Video` component must be wrapped in a `Media.Container` component.
 */
export const Video: React.ForwardRefExoticComponent<VideoProps & RefAttributes<HTMLVideoElement>> = forwardRef<HTMLVideoElement, VideoProps>(function Video({ children, ...props }, f_ref) {
    const ref = useRef<HTMLVideoElement>(null);
    const [, setElement] = useMediaElementState();
    const { active, activate } = useContext(LoadingContext);

    useEffect(() => {
        if (ref.current?.parentElement?.getAttribute('data-media-container') !== 'true') 
            throw new Error('Video element must be wrapped in a <Media.Container />');
        setElement(ref.current);
        return () => setElement(null);
    }, [setElement]);

    return <video {...props} preload={active ? props.preload : 'none'} autoPlay={active && props.autoPlay} onPlay={event => {
        activate();
        props.onPlay?.(event);
    }} ref={current => {
        // @ts-ignore
        ref.current = current;
        if (typeof f_ref === 'function') f_ref(current);
        // @ts-ignore
        else if (f_ref) f_ref.current = current;
    }}>
        {children}
    </video>;
});

export type AudioProps = ComponentPropsWithoutRef<"audio">;

/**
 * The `Media.Audio` component is a wrapper around the HTML5 `<audio>` element. It accepts all props that an `audio` element accepts.
 */
export const Audio: React.ForwardRefExoticComponent<AudioProps & RefAttributes<HTMLAudioElement>> = forwardRef<HTMLAudioElement, AudioProps>(function Audio({ children, ...props }, f_ref) {
    const ref = useRef<HTMLAudioElement>(null);
    const [, setElement] = useMediaElementState();
    const { active, activate } = useContext(LoadingContext);

    useEffect(() => {
        setElement(ref.current);
        return () => setElement(null);
    }, [setElement]);

    return <audio {...props} preload={active ? props.preload : 'none'} autoPlay={active && props.autoPlay} onPlay={event => {
        activate();
        props.onPlay?.(event);
    }} ref={current => {
        // @ts-ignore
        ref.current = current;
        if (typeof f_ref === 'function') f_ref(current);
        // @ts-ignore
        else if (f_ref) f_ref.current = current;
    }}>
        {children}
    </audio>;
});

export type ContainerProps = ComponentPropsWithoutRef<'div'>;

/**
 * The `Media.Container` component is a wrapper around the video element. It is required by other parts of the React AV library 
 * to correctly render overlays and captions. It acts as a portal for both captions and the `Media.Viewport` component.
 *
 * It is a `HTMLDivElement` and accepts all props that a `div` element accepts.
 */
export const Container: React.ForwardRefExoticComponent<ContainerProps & RefAttributes<HTMLDivElement>> = forwardRef<HTMLDivElement, ContainerProps>(function Container({ children, style, onPointerDownCapture, onFocusCapture, ...props }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { active, activate } = useContext(LoadingContext);
    const loadingState = useMediaLoadingState();
    useImperativeHandle(ref, () => containerRef.current!, []);

    useEffect(() => {
        if (active || !containerRef.current) return;
        if (typeof IntersectionObserver === 'undefined') {
            activate();
            return;
        }
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) activate();
        }, { rootMargin: '200px' });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [active, activate]);

    return <div {...props} style={{ position: 'relative', ...(style || {}) }} ref={containerRef} data-media-container="true"
        data-media-loading={loadingState}
        onPointerDownCapture={event => {
            activate();
            onPointerDownCapture?.(event);
        }}
        onFocusCapture={event => {
            activate();
            onFocusCapture?.(event);
        }}
    >
        {children}
    </div>
});

export const ViewportHoverContext = createContext<boolean | undefined>(undefined);

export function useMediaViewportHover() {
    return useContext(ViewportHoverContext);
}

export type ViewportProps = Omit<ComponentPropsWithoutRef<'div'>, "onMouseMove"> & {
    hoverInactiveTimeout?: number, 
    inactiveClassName?: string 
};

/**
 * The `Media.Viewport` component allows you to overlay UI components on top of the video element. 
 * It portals the UI components to the `Media.Container` component.
 * 
 * It is a `HTMLDivElement` and accepts all props that a `div` element accepts.
 */
export const Viewport: React.ForwardRefExoticComponent<ViewportProps & RefAttributes<HTMLDivElement>> = forwardRef<HTMLDivElement, ViewportProps>(function Viewport({ children, hoverInactiveTimeout = 2000, className, inactiveClassName, onPointerMove, onPointerDown, onPointerLeave, ...props }, ref) {
    const element = useMediaElement();
    const [ hover, setHover ] = useState(false);
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(hoverTimeout.current), []);

    function showControls() {
        setHover(true);
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => setHover(false), hoverInactiveTimeout);
    }

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        onPointerMove?.(event);
        showControls();
    }

    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
        onPointerDown?.(event);
        showControls();
    }

    function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
        onPointerLeave?.(event);
        if (event.pointerType === 'mouse') {
            clearTimeout(hoverTimeout.current);
            setHover(false);
        }
    }

    const overlay = <ViewportHoverContext.Provider value={hover}>
        <div 
            {...props} 
            data-media-viewport="true"
            data-media-viewport-hover={""+hover}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerLeave}
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
