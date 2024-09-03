import React, { ComponentPropsWithoutRef, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Renderer, WebVTTUpdateTextTracksDisplay } from '@react-av/vtt-core';
import { useMediaElement, useMediaPlaying, useMediaViewportHover } from "@react-av/core";

const InterfaceOverlay = forwardRef<HTMLDivElement, Omit<ComponentPropsWithoutRef<'div'>, "tabIndex"> & { persistent?: boolean, inactiveClassName?: string }>(function InterfaceOverlay({ children, persistent, inactiveClassName, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, f_ref) {
    const element = useMediaElement();
    const hover = useMediaViewportHover();
    const ref = useRef<HTMLDivElement>(null);
    const [playing] = useMediaPlaying();
    const [active, setActive] = useState(false);
    const isHidden = useMemo(() => {
        return hover !== undefined && !hover && !persistent && playing && !active;
    }, [hover, persistent, playing, active]);

    useEffect(() => {
        if (!element || !ref.current || isHidden) return;
        Renderer.addUIContainer(element as HTMLVideoElement, ref.current);
        element?.nodeName === "VIDEO" && WebVTTUpdateTextTracksDisplay(element as HTMLVideoElement);
        return () => {
            Renderer.removeUIContainer(element as HTMLVideoElement);
            element?.nodeName === "VIDEO" && WebVTTUpdateTextTracksDisplay(element as HTMLVideoElement, true);
        }
    }, [element, isHidden]);

    return <div 
        {...props} 
        data-media-overlay-inactive={""+isHidden}
        tabIndex={0}
        className={`${className} ${isHidden ? inactiveClassName || "" : ""}`.trim() || undefined}
        onMouseLeave={function (e) { onMouseLeave?.apply(arguments, [e]); setActive(false); }}
        onMouseEnter={function (e) { onMouseEnter?.apply(arguments, [e]); setActive(true); }}
        onFocus={function (e) { onFocus?.apply(arguments, [e]); setActive(true); }}
        onBlur={function (e) { onBlur?.apply(arguments, [e]); setActive(false); }}
        ref={current => {
            // @ts-ignore
            ref.current = current;
            if (typeof f_ref === 'function') f_ref(current);
            // @ts-ignore
            else if (f_ref) f_ref.current = current;
        }}
    >
        {children}
    </div>
});

export default InterfaceOverlay;
