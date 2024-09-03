import React, { createContext, CSSProperties, useContext, useState } from "react";

export interface TimelineEditorStyling {
    timelineEditorContainer?: string | CSSProperties,
}

export interface TimelineEditorProps {
    styling?: TimelineEditorStyling,
    children?: React.ReactNode,
}

export interface TimelineEditorContextValue {
    timelineInterval: number,
    setTimelineInterval: React.Dispatch<React.SetStateAction<number>>,
}

const TimelineEditorContext = createContext<TimelineEditorContextValue | undefined>(undefined);

export function useTimelineEditorContext() {
    const context = useContext(TimelineEditorContext);
    if (!context) {
        throw new Error('useTimelineEditorContext must be used within a TimelineEditor component');
    }
    return context;
}

export function TimelineEditor({
    children,
    styling
}: TimelineEditorProps) {
    const [timelineInterval, setTimelineInterval] = useState(5);

    return <div 
        style={{
            display: 'flex',
            flexDirection: 'column',
            ...(typeof styling?.timelineEditorContainer === 'string' ? {} : styling?.timelineEditorContainer)
        } as CSSProperties}
        className={typeof styling?.timelineEditorContainer === 'string' ? styling.timelineEditorContainer : undefined}
    >
        <TimelineEditorContext.Provider value={{ timelineInterval, setTimelineInterval }}>
            {
                children
            }
        </TimelineEditorContext.Provider>
    </div>
}