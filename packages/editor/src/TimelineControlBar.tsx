import { PlayPause } from "@react-av/controls";
import { Spinner } from "phosphor-react";
import { useTimelineEditorContext } from "./TimelineEditor";
import { useMediaDuration } from "@react-av/core";
import React, { CSSProperties } from "react";

export interface TimelineControlBarStyling {
    timelineControlBarContainer?: string | CSSProperties,
    timelineControlBarPlayPauseContainer?: string | CSSProperties,
    timelineControlBarZoomContainer?: string | CSSProperties,
    timelineControlBarZoomButton?: string | CSSProperties,
    timelineControlBarPlayPauseSpinner?: string | CSSProperties,
    timelineControlBarPlayPauseButton?: string | CSSProperties,
    timelineControlBarPlayPauseSize?: number,
    timelineControlBarZoomTextTemplate?: (interval: number) => string,
    timelineControlBarZoomTextContainer?: string | CSSProperties,
    timelineControlBarZoomInIcon?: React.ReactNode,
    timelineControlBarZoomOutIcon?: React.ReactNode,
    timelineControlBarPlayIcon?: React.ReactNode,
    timelineControlBarPauseIcon?: React.ReactNode,
    timelineControlBarPlayPauseLoadingIcon?: React.ReactNode,
}

export interface TimelineControlBarProps {
    styling?: TimelineControlBarStyling,
}

function ZoomIn() {
    return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159ZM4.25 6.5C4.25 6.22386 4.47386 6 4.75 6H6V4.75C6 4.47386 6.22386 4.25 6.5 4.25C6.77614 4.25 7 4.47386 7 4.75V6H8.25C8.52614 6 8.75 6.22386 8.75 6.5C8.75 6.77614 8.52614 7 8.25 7H7V8.25C7 8.52614 6.77614 8.75 6.5 8.75C6.22386 8.75 6 8.52614 6 8.25V7H4.75C4.47386 7 4.25 6.77614 4.25 6.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
}

function ZoomOut() {
    return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 10C8.433 10 10 8.433 10 6.5C10 4.567 8.433 3 6.5 3C4.567 3 3 4.567 3 6.5C3 8.433 4.567 10 6.5 10ZM6.5 11C7.56251 11 8.53901 10.6318 9.30884 10.0159L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L10.0159 9.30884C10.6318 8.53901 11 7.56251 11 6.5C11 4.01472 8.98528 2 6.5 2C4.01472 2 2 4.01472 2 6.5C2 8.98528 4.01472 11 6.5 11ZM4.75 6C4.47386 6 4.25 6.22386 4.25 6.5C4.25 6.77614 4.47386 7 4.75 7H8.25C8.52614 7 8.75 6.77614 8.75 6.5C8.75 6.22386 8.52614 6 8.25 6H4.75Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
}

export function TimelineControlBar({
    styling
}: TimelineControlBarProps) {
    const {
        timelineInterval,
        setTimelineInterval,
    } = useTimelineEditorContext();

    const duration = useMediaDuration();

    return <div 
        style={{
            display: 'flex',
            flexDirection: 'row',
            padding: '0.5rem',
            ...(typeof styling?.timelineControlBarContainer === 'string' ? {} : styling?.timelineControlBarContainer)
        } as CSSProperties}
        className={typeof styling?.timelineControlBarContainer === 'string' ? styling.timelineControlBarContainer : undefined}
    >
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.5rem',
                flexGrow: 1,
                ...(typeof styling?.timelineControlBarPlayPauseContainer === 'string' ? {} : styling?.timelineControlBarPlayPauseContainer)
            } as CSSProperties}
            className={typeof styling?.timelineControlBarPlayPauseContainer === 'string' ? styling.timelineControlBarPlayPauseContainer : undefined}
        >
            <PlayPause 
                defaultIconSize={styling?.timelineControlBarPlayPauseSize ?? 21} 
                className={typeof styling?.timelineControlBarPlayPauseButton === 'string' ? styling.timelineControlBarPlayPauseButton : undefined}
                style={typeof styling?.timelineControlBarPlayPauseButton === 'string' ? {} : styling?.timelineControlBarPlayPauseButton} 
                playIcon={styling?.timelineControlBarPlayIcon}
                pauseIcon={styling?.timelineControlBarPauseIcon}
                loadingIcon={
                    styling?.timelineControlBarPlayPauseLoadingIcon ??
                    <Spinner 
                        size={styling?.timelineControlBarPlayPauseSize ?? 21}
                        className={typeof styling?.timelineControlBarPlayPauseSpinner === 'string' ? styling.timelineControlBarPlayPauseSpinner : undefined}
                        style={typeof styling?.timelineControlBarPlayPauseSpinner === 'string' ? {} : styling?.timelineControlBarPlayPauseSpinner}
                    />
                } 
            />
        </div>
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.5rem',
                alignItems: 'center',
                ...(typeof styling?.timelineControlBarZoomContainer === 'string' ? {} : styling?.timelineControlBarZoomContainer)
            } as CSSProperties} 
            className={typeof styling?.timelineControlBarZoomContainer === 'string' ? styling.timelineControlBarZoomContainer : undefined}
        >
            <button 
                style={typeof styling?.timelineControlBarZoomButton === 'string' ? {} : styling?.timelineControlBarZoomButton}
                className={typeof styling?.timelineControlBarZoomButton === 'string' ? styling.timelineControlBarZoomButton : undefined}
                onClick={() => setTimelineInterval(interval => Math.max(1, interval - 1))}
            >
                {/* TODO: Tooltip = Zoom In */}
                {
                    styling?.timelineControlBarZoomInIcon ? styling.timelineControlBarZoomInIcon : <ZoomIn />
                }
            </button>
            <span 
                style={typeof styling?.timelineControlBarZoomTextContainer === 'string' ? {} : styling?.timelineControlBarZoomTextContainer}
                className={typeof styling?.timelineControlBarZoomTextContainer === 'string' ? styling.timelineControlBarZoomTextContainer : undefined}
            >
                {
                    styling?.timelineControlBarZoomTextTemplate ? styling.timelineControlBarZoomTextTemplate(timelineInterval) : `${timelineInterval} sec`
                }
            </span>
            <button 
                style={typeof styling?.timelineControlBarZoomButton === 'string' ? {} : styling?.timelineControlBarZoomButton}
                className={typeof styling?.timelineControlBarZoomButton === 'string' ? styling.timelineControlBarZoomButton : undefined}
                onClick={() => setTimelineInterval(interval => Math.min(Math.max(5, Math.floor(duration / 40) * 10), interval + 1))}
            >
                {/* TODO: Tooltip = Zoom Out */}
                {
                    styling?.timelineControlBarZoomOutIcon ? styling.timelineControlBarZoomOutIcon : <ZoomOut />
                }
            </button>
        </div>
    </div>
}