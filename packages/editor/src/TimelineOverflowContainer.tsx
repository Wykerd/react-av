import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes } from "react";
import { useEditorContext } from "./Editor";

export type TimelineOverflowContainerProps = ComponentPropsWithoutRef<'div'> & { 
    componentRole?: "timeline-header" | "timeline" 
};

export const TimelineOverflowContainer: React.ForwardRefExoticComponent<TimelineOverflowContainerProps & RefAttributes<HTMLDivElement>> = forwardRef<HTMLDivElement, TimelineOverflowContainerProps>(
    function TimelineOverflowContainer({
        componentRole = "timeline",
        className,
        style,
        ...props
    }, ref) {
        const {
            styling
        } = useEditorContext();

        const containerStyle = componentRole === 'timeline' ? styling?.timelineReelContainer : styling?.timelineHeaderReelContainer;

        return <div 
            ref={ref} {...props} 
            className={
                [
                    className ? className : '',
                    typeof containerStyle === 'string' ? containerStyle : '',
                    typeof styling?.timelineBaseReelContainer === 'string' ? styling.timelineBaseReelContainer : ''
                ].join(' ')
            }
            style={{
                ...(typeof styling?.timelineBaseReelContainer === 'string' ? {} : styling?.timelineBaseReelContainer),
                ...(typeof containerStyle === 'string' ? {} : containerStyle),
                ...style,
                overflow: 'hidden',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative',
                height: 
                    componentRole === 'timeline' 
                        ? 'calc(40px + 40px * var(--lines, 0) - 0.5rem * var(--lines, 0))' 
                        : typeof containerStyle === 'string' 
                            ? typeof styling?.timelineHeaderReelContainer === 'string' 
                                ? undefined 
                                : styling?.timelineHeaderReelContainer?.height 
                            : containerStyle?.height,
            }}
        >
            {props.children}
        </div>
    }
);