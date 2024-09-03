import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes, useEffect, useRef } from "react";
import { useMediaProgressBarTooltip } from "./ProgressBarRoot";
import useResizeObserver from "use-resize-observer";

export type ProgressBarTooltipProps = ComponentPropsWithoutRef<'div'> & {
    showingClassName?: string;
    position?: "center" | "left" | "right";
    onShowChange?: (showing: boolean) => void;
};

export const ProgressBarTooltip: React.ForwardRefExoticComponent<ProgressBarTooltipProps & RefAttributes<HTMLDivElement>> = forwardRef<HTMLDivElement, ProgressBarTooltipProps>(function ProgressBarTooltip({ 
    style, showingClassName = "", className="", position = "center", onShowChange, children, ...props 
}, ref) {
    const {
        percentage,
        root,
        show,
    } = useMediaProgressBarTooltip();

    const i_ref = useRef<HTMLDivElement>(null);

    const { width = 0 } = useResizeObserver({
        ref: i_ref
    });
    const { width: containerWidth = 0 } = useResizeObserver({
        ref: root
    });

    useEffect(() => {
        if (onShowChange) {
            onShowChange(show);
        }
    }, [show]);
    
    return <div 
        {...props}
        ref={current => {
            if (typeof ref === "function") ref(current);
            // @ts-ignore
            else if (ref) ref.current = current;
            // @ts-ignore
            i_ref.current = current;
        }} 
        data-tooltip-state={show ? "showing" : "hidden"}
        style={{
            ...(style || {}),
            left: 
                position === 'center' ?
                    `max(min(${percentage * 100}%, ${(containerWidth ?? 0) - ((width ?? 0) / 2)}px), ${(width ?? 0) / 2}px)` :
                position === 'left' ?
                    `max(min(${percentage * 100}%, ${(containerWidth ?? 0) - (width ?? 0)}px), 0px)` :
                    `max(min(${percentage * 100}%, ${(containerWidth ?? 0)}px), ${(width ?? 0)}px)`
        }}
        className={`${className} ${show ? showingClassName : ""}`.trim() || undefined}
    >
        {children}
    </div>
});
