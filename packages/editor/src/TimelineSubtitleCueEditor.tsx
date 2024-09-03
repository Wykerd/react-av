import { useTimelineSubtitleCueEditor } from "./TimelineSubtitlesTrack";
import React, { type CSSProperties, useId } from "react";

export interface TimelineSubtitleCueEditorStylingProps {
    timelineSubtitleCueEditorPanelTitleText?: string,
    timelineSubtitleCueEditorPanelTitleContainer?: string | CSSProperties,
    timelineSubtitleCueEditorContainer?: string | CSSProperties,
    timelineSubtitleCueEditorCueContentLabel?: string | CSSProperties,
    timelineSubtitleCueEditorCueContentField?: string | CSSProperties,
    timelineSubtitleCueEditorCueContentLabelText?: string,
    timelineSubtitleCueEditorActionsContainer?: string | CSSProperties,
    timelineSubtitleCueEditorBaseButton?: string | CSSProperties,
    timelineSubtitleCueEditorFocusTimelineButton?: string | CSSProperties,
    timelineSubtitleCueEditorFocusTimelineButtonText?: string,
    timelineSubtitleCueEditorFocusTimelineIcon?: React.ReactElement,
    timelineSubtitleCueEditorDeleteButton?: string | CSSProperties,
    timelineSubtitleCueEditorDeleteButtonText?: string,
    timelineSubtitleCueEditorDeleteIcon?: React.ReactElement,
    timelineSubtitleCueEditorDoneButton?: string | CSSProperties,
    timelineSubtitleCueEditorDoneButtonText?: string,
    timelineSubtitleCueEditorDoneIcon?: React.ReactElement
}

export interface TimelineSubtitleCueEditorProps {
    styling?: TimelineSubtitleCueEditorStylingProps
}

export function TimelineSubtitleCueEditor({
    styling
}: TimelineSubtitleCueEditorProps) {
    const cueEditor = useTimelineSubtitleCueEditor();
    const labelId = useId();

    if (!cueEditor.entry) return null;

    return <>
        <div 
            style={typeof styling?.timelineSubtitleCueEditorPanelTitleContainer === 'string' ? {} : styling?.timelineSubtitleCueEditorPanelTitleContainer}
            className={typeof styling?.timelineSubtitleCueEditorPanelTitleContainer === 'string' ? styling.timelineSubtitleCueEditorPanelTitleContainer : undefined}
        >
            {styling?.timelineSubtitleCueEditorPanelTitleText ?? 'Properties'}
        </div>
        <div 
            ref={cueEditor.focusRef} 
            style={typeof styling?.timelineSubtitleCueEditorContainer === 'string' ? {} : styling?.timelineSubtitleCueEditorContainer}
            className={typeof styling?.timelineSubtitleCueEditorContainer === 'string' ? styling.timelineSubtitleCueEditorContainer : undefined}
        >
            <label 
                htmlFor={"cue_text" + labelId}
                style={typeof styling?.timelineSubtitleCueEditorCueContentLabel === 'string' ? {} : styling?.timelineSubtitleCueEditorCueContentLabel}
                className={typeof styling?.timelineSubtitleCueEditorCueContentLabel === 'string' ? styling.timelineSubtitleCueEditorCueContentLabel : undefined}
            >
                {styling?.timelineSubtitleCueEditorCueContentLabelText ?? 'Cue Content'}
            </label>
            <div>
                <textarea 
                    aria-multiline="true" 
                    id={"cue_text" + labelId}
                    value={cueEditor.entry.text} 
                    onChange={e => {
                        const value = e.target.value;
                        cueEditor.entry!.text = value;
                        cueEditor.sync();
                    }} 
                    style={typeof styling?.timelineSubtitleCueEditorCueContentField === 'string' ? {} : styling?.timelineSubtitleCueEditorCueContentField}
                    className={typeof styling?.timelineSubtitleCueEditorCueContentField === 'string' ? styling.timelineSubtitleCueEditorCueContentField : undefined}
                />
            </div>
            <div
                style={typeof styling?.timelineSubtitleCueEditorActionsContainer === 'string' ? {} : styling?.timelineSubtitleCueEditorActionsContainer}
                className={typeof styling?.timelineSubtitleCueEditorActionsContainer === 'string' ? styling.timelineSubtitleCueEditorActionsContainer : undefined}
            >
                <button 
                    className={
                        [
                            typeof styling?.timelineSubtitleCueEditorBaseButton === 'string' ? styling.timelineSubtitleCueEditorBaseButton : undefined,
                            typeof styling?.timelineSubtitleCueEditorFocusTimelineButton === 'string' ? styling.timelineSubtitleCueEditorFocusTimelineButton : undefined
                        ].join(' ')
                    }
                    style={{
                        ...(
                            typeof styling?.timelineSubtitleCueEditorBaseButton === 'string' ? {} : styling?.timelineSubtitleCueEditorBaseButton
                        ),
                        ...(
                            typeof styling?.timelineSubtitleCueEditorFocusTimelineButton === 'string' ? {} : styling?.timelineSubtitleCueEditorFocusTimelineButton
                        )
                    }}
                    onClick={() => {
                        cueEditor.focusTimeline();
                    }}
                >
                    {styling?.timelineSubtitleCueEditorFocusTimelineIcon}
                    {styling?.timelineSubtitleCueEditorFocusTimelineButtonText ?? 'Back to Timeline'}
                </button>
                <button
                    className={
                        [
                            typeof styling?.timelineSubtitleCueEditorBaseButton === 'string' ? styling.timelineSubtitleCueEditorBaseButton : undefined,
                            typeof styling?.timelineSubtitleCueEditorDeleteButton === 'string' ? styling.timelineSubtitleCueEditorDeleteButton : undefined
                        ].join(' ')
                    }
                    style={{
                        ...(
                            typeof styling?.timelineSubtitleCueEditorBaseButton === 'string' ? {} : styling?.timelineSubtitleCueEditorBaseButton
                        ),
                        ...(
                            typeof styling?.timelineSubtitleCueEditorDeleteButton === 'string' ? {} : styling?.timelineSubtitleCueEditorDeleteButton
                        )
                    }} 
                    onClick={() => {
                        cueEditor.delete();
                    }}
                >
                    {styling?.timelineSubtitleCueEditorDeleteIcon}
                    {styling?.timelineSubtitleCueEditorDeleteButtonText ?? 'Delete'}
                </button>
                <button 
                    className={
                        [
                            typeof styling?.timelineSubtitleCueEditorBaseButton === 'string' ? styling.timelineSubtitleCueEditorBaseButton : undefined,
                            typeof styling?.timelineSubtitleCueEditorDoneButton === 'string' ? styling.timelineSubtitleCueEditorDoneButton : undefined
                        ].join(' ')
                    }
                    style={{
                        ...(
                            typeof styling?.timelineSubtitleCueEditorBaseButton === 'string' ? {} : styling?.timelineSubtitleCueEditorBaseButton
                        ),
                        ...(
                            typeof styling?.timelineSubtitleCueEditorDoneButton === 'string' ? {} : styling?.timelineSubtitleCueEditorDoneButton
                        )
                    }}
                    onClick={() => {
                        cueEditor.deselect();
                    }}
                >
                    {styling?.timelineSubtitleCueEditorDoneIcon}
                    {styling?.timelineSubtitleCueEditorDoneButtonText ?? 'Done'}
                </button>
            </div>
        </div>
    </>
}