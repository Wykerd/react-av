import React, { forwardRef, HTMLAttributes, useEffect, useRef } from "react";
import { useSize } from "@react-av/core";
import { useMediaProgressBarTooltip } from "./ProgressBarRoot";

export type ProgressBarTooltipProps = HTMLAttributes<HTMLDivElement> & {
    showingClassName?: string;
    position?: "center" | "left" | "right";
    onShowChange?: (showing: boolean) => void;
};

export const ProgressBarTooltip = forwardRef<HTMLDivElement, ProgressBarTooltipProps>(function ProgressBarTooltip({ 
    style, showingClassName = "", className="", position = "center", onShowChange, children, ...props 
}, ref) {
    const {
        percentage,
        root,
        show,
    } = useMediaProgressBarTooltip();

    const i_ref = useRef<HTMLDivElement>(null);

    const size = useSize(i_ref);
    const containerSize = useSize(root);

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
                    `max(min(${percentage * 100}%, ${(containerSize?.width ?? 0) - ((size?.width ?? 0) / 2)}px), ${(size?.width ?? 0) / 2}px)` :
                position === 'left' ?
                    `max(min(${percentage * 100}%, ${(containerSize?.width ?? 0) - (size?.width ?? 0)}px), 0px)` :
                    `max(min(${percentage * 100}%, ${(containerSize?.width ?? 0)}px), ${(size?.width ?? 0)}px)`
        }}
        className={`${className} ${show ? showingClassName : ""}`.trim() || undefined}
    >
        {children}
    </div>
});
