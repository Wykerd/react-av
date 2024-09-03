import React from "react";

export interface TimelineContainerStyling {
    timelineContainer?: string | React.CSSProperties;
}

export interface TimelineContainerProps {
    children?: React.ReactNode;
    styling?: TimelineContainerStyling;
}

export function TimelineContainer({
    styling,
    children
}: TimelineContainerProps) {
    return <div 
        style={{
            marginBottom: '-1px',
            ...(typeof styling?.timelineContainer === 'string' ? {} : styling?.timelineContainer),
            display: 'grid',
            gridTemplateColumns: 'min-content 1fr',
            position: 'relative'
        }}
        className={typeof styling?.timelineContainer === 'string' ? styling.timelineContainer : undefined}
    >
        {
            children
        }
    </div>
}