import React, { type HTMLAttributes, forwardRef, CSSProperties } from "react";
import { useEditorContext } from "./Editor";

export type DragElementProps = HTMLAttributes<HTMLDivElement> & { selected?: boolean, base?: string | CSSProperties };

export const DragElement = forwardRef<HTMLDivElement, DragElementProps>(
    function DragElement({
        className,
        selected,
        children,
        style,
        base,
        ...props
    }, ref) {
        const { styling } = useEditorContext();

        const baseStyling = base ?? styling?.timelineDragElementBase;

        return <div
            ref={ref}
            {...props}
            className={
                [
                    className ? className : '',
                    selected 
                        ? typeof styling?.timelineDragElementSelected === 'string' ? styling.timelineDragElementSelected : ''
                        : typeof baseStyling === 'string' ? baseStyling : ''
                ].join(' ')
            }
            style={{
                top: 0,
                ...(
                    selected 
                        ? typeof styling?.timelineDragElementSelected === 'string' ? {} : styling?.timelineDragElementSelected
                        : typeof baseStyling === 'string' ? {} : baseStyling
                ),
                position: 'absolute',
                height: 'calc(40px - 1rem)',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                outline: 'none',
                ...style,
            }}
        >
            {children}   
        </div>
    }
)

export const DraftElement = forwardRef<HTMLDivElement, DragElementProps>(
    function DraftElement({
        children,
        ...props
    }, ref) {
        const { styling } = useEditorContext();

        return <DragElement {...props} ref={ref} base={styling?.timelineDraftElementBase}>
            {children}
        </DragElement>
    }
)

export const TimelineElement = forwardRef<HTMLDivElement, DragElementProps>(
    function TimelineElement({
        className,
        children,
        style,
        ...props
    }, ref) {
        const { styling } = useEditorContext();

        return <DragElement 
            {...props} ref={ref} 
            base={styling?.timelineTimelineElementBase} 
            className={
                [
                    className ? className : '',
                    typeof styling?.timelineTimelineElement === 'string' ? styling.timelineTimelineElement : ''
                ].join(' ')
            }
            style={{
                ...(typeof styling?.timelineTimelineElement === 'string' ? {} : styling?.timelineTimelineElement),
                ...style
            }}
        >
            {children}
        </DragElement>
    }
);

export const PlayheadLine = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    function PlayheadLine({
        className,
        children,
        style,
        ...props
    }, ref) {
        const { styling } = useEditorContext();

        return <div 
            {...props} 
            ref={ref} 
            style={{
                ...(typeof styling?.timelinePlayheadLine === 'string' ? {} : styling?.timelinePlayheadLine),
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                position: 'absolute'
            }}
            className={
                [
                    className ? className : '',
                    typeof styling?.timelinePlayheadLine === 'string' ? styling.timelinePlayheadLine : ''
                ].join(' ')
            }
        >
            {children}
        </div>
    }
)