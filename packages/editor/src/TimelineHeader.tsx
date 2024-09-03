import * as Media from '@react-av/core';
import React from 'react';
import type { ReactNode, CSSProperties, ReactElement } from 'react';
import { useState, useMemo, cloneElement } from 'react';
import { toTimestampString as toTimestampStringShort } from "@react-av/controls";
import { toTimestampString } from '@react-av/vtt-core';
import useResizeObserver from 'use-resize-observer';
import { TimelineOverflowContainer } from './TimelineOverflowContainer';
import { useTimelineEditorContext } from './TimelineEditor';

function parseTimestampString(timestamp: string): number {
    const [hms, ms] = timestamp.split(".");
    if (!hms) {
        if (ms) {
            const msInt = parseInt(ms);
            if (Number.isNaN(msInt)) {
                return 0;
            }
            return msInt / 1000;
        }
        return 0;
    }
    let timeUnits = hms.split(":");
    if (timeUnits.length > 3) {
        // use only the last 3
        timeUnits = timeUnits.slice(timeUnits.length - 3);
    }
    if (timeUnits.length < 3) {
        // pad with 0s
        timeUnits = new Array<string>(3 - timeUnits.length).fill("0").concat(timeUnits);
    }
    const [hours, minutes, seconds] = timeUnits.map((unit) => parseInt(unit));
    const msInt = ms ? parseInt(ms) : 0;
    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds) || Number.isNaN(msInt))
        return 0;
    return hours * 3600 + minutes * 60 + seconds + msInt / 1000;
}

export interface TimelineHeaderStyling {
    timelineHeaderTimestampIndicator?: string | CSSProperties;
    timelineHeaderTimestampInputContainer?: string | CSSProperties;
    timelineHeaderTimestampInput?: string | CSSProperties;
    timelineHeaderPlayhead?: string | CSSProperties;
    timelineHeaderIndicatorReel?: string | CSSProperties;
}

export interface TimelineHeaderProps {
    styling?: TimelineHeaderStyling,
}

export function TimelineHeader({
    styling
}: TimelineHeaderProps) {
    const { timelineInterval: interval } = useTimelineEditorContext();

    const [currentTime, setCurrentTime] = Media.useMediaCurrentTimeFine();
    const [internalTime, setInternalTime] = useState<string | false>(false);
    const [, setPlaying] = Media.useMediaPlaying();
    const duration = Media.useMediaDuration();
    const [anchor, setAnchor] = useState(0);
    const [anchorTime, setAnchorTime] = useState(0);
    const [dragging, setDragging] = useState(false);
    const timelineIntervalCount = useMemo(() => {
        if (!duration) return 0;
        return Math.ceil(duration / interval);
    }, [duration, interval]);

    const { width: trackWidth, ref: trackRef } = useResizeObserver();
    const { width: containerWidth, ref: containerRef } = useResizeObserver();
    const { width: indicatorWidth, ref: indicatorRef } = useResizeObserver();

    const { indicators, intervalWidth } = useMemo(() => {
        const indicators: ReactElement<HTMLDivElement>[] = [];

        const includeHours = Boolean(duration && duration > 3600);

        for (let i = 0; i < timelineIntervalCount; i++) {
            indicators.push(<div 
                key={i} 
                style={typeof styling?.timelineHeaderTimestampIndicator === 'string' ? {} : styling?.timelineHeaderTimestampIndicator}
                className={typeof styling?.timelineHeaderTimestampIndicator === 'string' ? styling.timelineHeaderTimestampIndicator : undefined}
            >
                {toTimestampStringShort(i * interval, includeHours)}
            </div>)
        }

        const finalIntervalTime = (timelineIntervalCount - 1) * interval;
        const finalIntervalWidth = Math.abs(((duration || 0) - finalIntervalTime) / interval * 8);

        if (duration) {
            indicators.push(<div 
                style={typeof styling?.timelineHeaderTimestampIndicator === 'string' ? {} : styling?.timelineHeaderTimestampIndicator}
                className={typeof styling?.timelineHeaderTimestampIndicator === 'string' ? styling.timelineHeaderTimestampIndicator : undefined}
                key={timelineIntervalCount} ref={indicatorRef}
            >
                {toTimestampStringShort(duration, includeHours)}
            </div>);
        }

        // the second last indicator must be made trasparent
        if (indicators.length > 1) {
            indicators[indicators.length - 2] = cloneElement(indicators[indicators.length - 2]!, {
                style: {
                    ...indicators[indicators.length - 2]!.props.style,
                    color: 'transparent'
                }
            });
        }

        return { indicators, intervalWidth: finalIntervalWidth };
    }, [duration, interval, timelineIntervalCount, styling]);

    return <>
        <div 
            style={typeof styling?.timelineHeaderTimestampInputContainer === 'string' ? {} : styling?.timelineHeaderTimestampInputContainer}
            className={typeof styling?.timelineHeaderTimestampInputContainer === 'string' ? styling.timelineHeaderTimestampInputContainer : undefined}
        >
            <input 
                className={typeof styling?.timelineHeaderTimestampInput === 'string' ? styling.timelineHeaderTimestampInput : undefined}
                style={typeof styling?.timelineHeaderTimestampInput === 'string' ? {} : styling?.timelineHeaderTimestampInput}
                type="text" 
                aria-label="Timestamp"
                value={internalTime !== false ? internalTime : toTimestampString(currentTime)}
                onChange={e => {
                    setInternalTime(e.target.value.replace(/[^0-9:.]/g, ""));
                    setPlaying(false);
                    setCurrentTime(parseTimestampString(e.target.value));
                }}
                onFocus={() => setPlaying(false)}
                onBlur={() => setInternalTime(false)}
            />
        </div>
        <TimelineOverflowContainer 
            componentRole="timeline-header"
            ref={containerRef} 
            onMouseDown={e => {
                if (e.button !== 0) return;
                setPlaying(false);
                setAnchor(e.clientX);
                setAnchorTime(currentTime);
                setDragging(true);
            }}
            onTouchStart={e => {
                const touch = e.touches[0];
                if (!touch) return;
                setPlaying(false);
                setAnchor(touch.clientX);
                setAnchorTime(currentTime);
                setDragging(true);
            }}
            onMouseMove={e => {
                if (!indicatorWidth || !dragging) return;
                const delta = anchor - e.clientX;
                const timeDelta = (delta / (indicatorWidth + 16)) * interval;
                setCurrentTime(anchorTime + timeDelta);
            }}
            onTouchMove={e => {
                const touch = e.touches[0];
                if (!touch || !indicatorWidth) return;
                const delta = anchor - touch.clientX;
                const timeDelta = (delta / (indicatorWidth + 16)) * interval;
                setCurrentTime(anchorTime + timeDelta);
            }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onMouseEnter={() => setDragging(false)}
            onTouchEnd={() => setDragging(false)}
            style={{
                cursor: dragging ? 'grabbing' : 'grab'
            }}
        >
            <div
                style={{
                    ...(typeof styling?.timelineHeaderPlayhead === 'string' ? {} : styling?.timelineHeaderPlayhead),
                    left: '50%',
                    transform: `translateX(-50%)`,
                    position: 'absolute',
                    zIndex: 2,
                }} 
                className={typeof styling?.timelineHeaderPlayhead === 'string' ? styling.timelineHeaderPlayhead : undefined}
            />
            <div
                style={{
                    '--time-indicator-count': timelineIntervalCount + 1,
                    '--time-indicator-final-width': duration ? `${intervalWidth}rem` : undefined,
                    transform: `translateX(calc(${(containerWidth ?? 0) / 2}px - ${(currentTime / duration) * (trackWidth ?? 0)}px + ${(currentTime / duration) * 8}rem))`,
                    ...(typeof styling?.timelineHeaderIndicatorReel === 'string' ? {} : styling?.timelineHeaderIndicatorReel),
                    display: 'grid',
                    height: '100%',
                    width: 'min-content',
                    gridTemplateColumns: 'repeat(calc(var(--time-indicator-count, 2) - 2), 8rem) var(--time-indicator-final-width, 8rem) 8rem',
                } as CSSProperties} 
                className={typeof styling?.timelineHeaderIndicatorReel === 'string' ? styling.timelineHeaderIndicatorReel : undefined}
                ref={trackRef}
            >
                {
                    indicators
                }
            </div>
        </TimelineOverflowContainer>
    </>
}