import React, { ComponentPropsWithoutRef, createContext, forwardRef, RefAttributes, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MediaStoreProvider, useMediaElement, useMediaElementState } from "./state";

/**
 * The `Media.Root` component is the root of the React AV component tree. It provides the context for all other components to work.
 */
export function Root({ children } : { children: React.ReactNode }) {
    return <MediaStoreProvider>
        {children}
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

    useEffect(() => {
        setElement(ref.current);
    }, [setElement]);

    return <audio {...props} ref={current => {
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
export const Container: React.ForwardRefExoticComponent<ContainerProps & RefAttributes<HTMLDivElement>> = forwardRef<HTMLDivElement, ContainerProps>(function Container({ children, style, ...props }, ref) {
    return <div {...props} style={{ position: 'relative', ...(style || {}) }} ref={ref} data-media-container="true">
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
export const Viewport: React.ForwardRefExoticComponent<ViewportProps & RefAttributes<HTMLDivElement>> = forwardRef<HTMLDivElement, ViewportProps>(function Viewport({ children, hoverInactiveTimeout = 2000, className, inactiveClassName, ...props }, ref) {
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
            data-media-viewport="true"
            data-media-viewport-hover={""+hover}
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
