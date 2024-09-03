import React, { type ReactNode } from "react";
import { useEditorContext } from "./Editor";

export function TimelineEntryLabel({ 
    icon, 
    children, 
    label, 
    controls, 
}: { 
    icon: React.ReactElement, 
    children?: ReactNode, 
    label: string, 
    controls?: ReactNode
}) {
    const { styling } = useEditorContext();

    return <div 
        className={typeof styling?.timelineEntryLabelContainer === 'string' ? styling.timelineEntryLabelContainer : undefined}
        style={typeof styling?.timelineEntryLabelContainer === 'string' ? {} : styling?.timelineEntryLabelContainer}
    >
        { icon }
        <div 
            className={typeof styling?.timelineEntryLabelTextContainer === 'string' ? styling.timelineEntryLabelTextContainer : undefined}
            style={typeof styling?.timelineEntryLabelTextContainer === 'string' ? {} : styling?.timelineEntryLabelTextContainer}
        >
            <span
                className={typeof styling?.timelineEntryLabelText === 'string' ? styling.timelineEntryLabelText : undefined}
                style={typeof styling?.timelineEntryLabelText === 'string' ? {} : styling?.timelineEntryLabelText}
            >
                { label }
            </span>
            { children }
        </div>
        <div 
            className={typeof styling?.timelineEntryLabelControlsContainer === 'string' ? styling.timelineEntryLabelControlsContainer : undefined}
            style={typeof styling?.timelineEntryLabelControlsContainer === 'string' ? {} : styling?.timelineEntryLabelControlsContainer}
        >
            { controls }
        </div>
    </div>
}
