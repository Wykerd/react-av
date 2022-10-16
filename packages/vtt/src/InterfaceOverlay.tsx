import React, { forwardRef, HTMLAttributes, useEffect, useRef, useState } from "react";
import { Renderer } from '@react-av/vtt-core';
import { useMediaElement, useMediaPlaying, useMediaViewportHover } from "@react-av/core";

const InterfaceOverlay = forwardRef<HTMLDivElement, Omit<HTMLAttributes<HTMLDivElement>, "tabIndex"> & { persistent?: boolean, inactiveClassName?: string }>(function InterfaceOverlay({ children, persistent, inactiveClassName, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, f_ref) {
    const element = useMediaElement();
    const hover = useMediaViewportHover();
    const ref = useRef<HTMLDivElement>(null);
    const [playing] = useMediaPlaying();
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (!element || !ref.current || (hover !== undefined && !hover && !persistent && playing && !active)) return;
        Renderer.addUIContainer(element as HTMLVideoElement, ref.current);
        return () => {
            Renderer.removeUIContainer(element as HTMLVideoElement);
        }
    }, [element, hover, persistent, playing, active]);

    const isHidden = hover !== undefined && !hover && !persistent && playing && !active;

    return <div 
        {...props} 
        tabIndex={1}
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
