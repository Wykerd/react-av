import type { CSSProperties, ReactNode, RefObject} from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Media from '@react-av/core';
import useResizeObserver from "use-resize-observer";
import { TimelineEntryLabel } from "./TimelineEntryLabel";
import { TimelineOverflowContainer } from "./TimelineOverflowContainer";
import { DraftElement, DragElement, PlayheadLine, TimelineElement } from "./TimelineElements";
import { useEditorContext } from "./Editor";
import { useTimelineEditorContext } from "./TimelineEditor";

export interface TimelineEntryData {
    start: number,
    end: number,
    content?: ReactNode,
    symbol?: unknown,
    _draft?: "draft" | "selection"
}

export interface DraftTimelineEntryData { 
    start: number,
    end: number,
}

export interface TimelineTrackProps {
    labelComponent: React.ReactElement,

    draft?: DraftTimelineEntryData,
    snap?: boolean,
    
    selectedRef?: RefObject<HTMLDivElement>,

    onDraftCreate?: (draft: DraftTimelineEntryData) => void,
    entries?: TimelineEntryData[],

    onEntrySelect?: (entry?: TimelineEntryData) => void,
    selectedSymbol?: unknown,
    onEntryEdit?: (entry: TimelineEntryData) => void,

    onEntryMove?: (delta: number) => void,
    onEntryDelete?: () => void,
    onEntryResize?: (start: number, end: number) => void,
}

export function TimelineTrack({ 
    labelComponent,
    draft,
    snap,
    onDraftCreate,
    entries,
    onEntrySelect,
    selectedSymbol,
    onEntryMove,
    onEntryEdit,
    onEntryDelete,
    onEntryResize,
    selectedRef: externalSelectedRef
}: TimelineTrackProps) {
    const { styling } = useEditorContext();
    const { timelineInterval: interval } = useTimelineEditorContext();

    const [currentTime, setCurrentTime] = Media.useMediaCurrentTimeFine();
    const duration = Media.useMediaDuration();
    const [, setPlaying] = Media.useMediaPlaying();
    const [anchor, setAnchor] = useState(0);
    const [currentAnchor, setCurrentAnchor] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [moving, setMoving] = useState(false);
    const [resizing, setResizing] = useState<"start" | "end" | undefined>(undefined);
    const internalSelectedRef = useRef<HTMLDivElement>(null);
    const [interactionCursor, setInteractionCursor] = useState("default");

    const selectedRef = externalSelectedRef ?? internalSelectedRef;

    const containerRef = useRef<HTMLDivElement>(null);

    const { width: trackWidth, ref: trackRef } = useResizeObserver();
    const { width: containerWidth } = useResizeObserver({
        ref: containerRef
    });

    const selectedEntry = useMemo(() => {
        if (!selectedSymbol || !entries) return;
        return entries.find(entry => entry.symbol === selectedSymbol);
    }, [selectedSymbol, entries])

    const anchorTime = useMemo(() => {
        if (!duration) return 0;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return 0;
        const currentTimestampOffset = (rect.width / 2);
        const relativeAnchorX = anchor - rect.left;
        const delta = relativeAnchorX - currentTimestampOffset;
        const timeDelta = delta / (8 * 16) * interval;
        return Math.min(duration, Math.max(0, currentTime + timeDelta));
    }, [duration, anchor, interval, currentTime]);

    const currentAnchorTime = useMemo(() => {
        if (!duration) return 0;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return 0;
        const currentTimestampOffset = (rect.width / 2);
        const relativeAnchorX = currentAnchor - rect.left;
        const delta = relativeAnchorX - currentTimestampOffset;
        const timeDelta = delta / (8 * 16) * interval;
        return Math.min(duration, Math.max(0, currentTime + timeDelta));
    }, [duration, currentAnchor, interval, currentTime]);

    const [snapDeltaStart, snapDeltaEnd] = useMemo(() => {
        if (!snap) return [0, 0];
        if (!entries) return [0, 0];
        const snappingThreshold = interval / 20;

        let start = 0;
        let end = 0;
        if (dragging) {
            start = Math.min(anchorTime, currentAnchorTime);
            end = Math.max(anchorTime, currentAnchorTime);
        } else if (moving && selectedEntry) {
            const selected = entries?.find(entry => entry.symbol === selectedEntry.symbol);
            if (!selected) return [0, 0];
            start = selected.start + currentAnchorTime - anchorTime;
            end = selected.end + currentAnchorTime - anchorTime;
        } else if (resizing && selectedEntry) {
            const selected = entries?.find(entry => entry.symbol === selectedEntry.symbol);
            if (!selected) return [0, 0];
            start = resizing === "start" ? currentAnchorTime : selected.start;
            end = resizing === "end" ? currentAnchorTime : selected.end;
        }
        
        // find entry within snapping threshold
        const snappingStartStart = entries.find(entry => Math.abs(entry.start - start) < snappingThreshold);
        const snappingStartEnd = entries.find(entry => Math.abs(entry.end - start) < snappingThreshold);
        const snappingEndStart = entries.find(entry => Math.abs(entry.start - end) < snappingThreshold);
        const snappingEndEnd = entries.find(entry => Math.abs(entry.end - end) < snappingThreshold);
        const startSnap = snappingStartStart?.start ?? snappingStartEnd?.end;
        const endSnap = snappingEndStart?.start ?? snappingEndEnd?.end;
        const snapDeltaStart = startSnap ? startSnap - start : 0;
        const snapDeltaEnd = endSnap ? endSnap - end : 0;
        return [snapDeltaStart, snapDeltaEnd];
    }, [snap, entries, interval, dragging, moving, selectedEntry, resizing, anchorTime, currentAnchorTime]);

    function focusSelected() {
        selectedRef.current?.focus();
    }

    useEffect(() => {
        selectedRef.current?.focus();
    }, [selectedRef, selectedSymbol]);

    const [depthMap, maxDepth, sentries] = useMemo<[number[], number, typeof entries]>(() => {
        const overlaps = new Map<number, number[]>();
        const allEntries = [...(entries ?? [])];
        if (dragging) allEntries.push({
            start: Math.min(anchorTime, currentAnchorTime) + snapDeltaStart,
            end: Math.max(anchorTime, currentAnchorTime) + snapDeltaEnd,
            _draft: "selection"
        });
        if (draft) allEntries.push({
            start: draft.start,
            end: draft.end,
            _draft: "draft"
        });
        if (moving) {
            const snapDelta = (snapDeltaStart || snapDeltaEnd) ? Math.min(snapDeltaStart || Infinity, snapDeltaEnd || Infinity) : 0;
            const delta = ((currentAnchorTime + snapDelta) - anchorTime);
            const entry = allEntries.findIndex(e => e.symbol === selectedEntry?.symbol);
            if (entry !== -1) {
                // get the entry
                const e = {...allEntries[entry]!};
                // now remove the entry
                allEntries.splice(entry, 1);
                e.start += delta;
                e.end += delta;
                allEntries.push(e);
            }
        }
        const sizeThreshold = interval / 20;
        if (resizing) {
            const entry = allEntries.findIndex(e => e.symbol === selectedEntry?.symbol);
            if (entry !== -1) {
                // get the entry
                const e = {...allEntries[entry]!};
                // now remove the entry
                allEntries.splice(entry, 1);
                if (resizing === "start") {
                    e.start = Math.min(currentAnchorTime + snapDeltaStart, e.end - sizeThreshold);
                }
                if (resizing === "end") {
                    e.end = Math.max(currentAnchorTime + snapDeltaEnd, e.start + sizeThreshold);
                }
                allEntries.push(e);
            }
        }
        const sentries = allEntries.sort((a, b) => a.start - b.start).filter(entry => Math.abs(entry.start - entry.end) >= sizeThreshold);
        for (let i = 0; i < sentries.length; i++) {
            const entryX = sentries[i]!;
            for (let j = 0; j < i; j++) {
                const entryY = sentries[j]!;
                if ((entryX.end - entryY.start) * (entryY.end - entryX.start) > 0.001)
                    overlaps.set(i, [...(overlaps.get(i) ?? []), j]);
            }
        }
        const depths: number[] = [];
        for (let i = 0; i < sentries.length; i++) {
            if (!overlaps.has(i)) depths.push(0);
            else {
                let depth = 0;
                const indices = overlaps.get(i)!;
                const takenDepths = indices.map(i => depths[i]!);
                while (takenDepths.includes(depth)) depth++;
                depths.push(depth);
            }
        }
        return [depths, Math.max(...depths), sentries];
    }, [entries, dragging, anchorTime, currentAnchorTime, snapDeltaStart, snapDeltaEnd, draft, moving, interval, resizing, selectedEntry?.symbol]);

    function handleEntryDelete() {
        onEntryDelete?.();
        // select next sibling
        onEntrySelect?.(undefined);
        (selectedRef.current?.nextElementSibling as HTMLElement)?.focus();
    }

    function determineInteractionType(x: number) : "move" | "resize-start" | "resize-end" | "drag" {
        const selectedEntryBounds = selectedRef.current?.getBoundingClientRect();

        const innerDelta = selectedEntryBounds ? Math.min(selectedEntryBounds.width / 4, 10) : 0;

        if (selectedEntryBounds && x > selectedEntryBounds.left - 10 && x < selectedEntryBounds.left + innerDelta) return "resize-start";
        if (selectedEntryBounds && x > selectedEntryBounds.right - innerDelta && x < selectedEntryBounds.right + 10) return "resize-end";
        if (selectedEntryBounds && x > selectedEntryBounds.left && x < selectedEntryBounds.right) return "move";
        return "drag";
    }

    function handleInteractionDown(x: number) {
        const interactionType = determineInteractionType(x);
        setPlaying(false);
        setAnchor(x);
        setCurrentAnchor(x);
        switch (interactionType) {
            case "move":
                setMoving(true);
                break;
        
            case "resize-start":
                setResizing("start");
                break;

            case "resize-end":
                setResizing("end");
                break;

            case "drag":
                setDragging(true);
                break;
        }
    }

    function handleInteractionCursor(x: number) {
        const interactionType = determineInteractionType(x);
        if (resizing) return "ew-resize";
        if (moving) return "move";
        setInteractionCursor(
            interactionType === "move" ? "move" :
            interactionType === "resize-start" ? "ew-resize" :
            interactionType === "resize-end" ? "ew-resize" :
            "default"
        );
    }

    function handleDraftCreate() {
        if (!dragging) return;
        const start = Math.min(anchorTime, currentAnchorTime) + snapDeltaStart;
        const end = Math.max(anchorTime, currentAnchorTime) + snapDeltaEnd;
        onDraftCreate?.({start, end});
        setDragging(false);
    }

    function handleInteractionEnd() {
        if (dragging) {
            focusSelected();
            handleDraftCreate();
        } else if (moving) {
            focusSelected();
            const snapDelta = (snapDeltaStart || snapDeltaEnd) ? Math.min(snapDeltaStart || Infinity, snapDeltaEnd || Infinity) : 0;
            const delta = Math.round(((currentAnchorTime + snapDelta) - anchorTime) * 1000) / 1000;
            onEntryMove?.(delta);
            setMoving(false);
        } else if (resizing && selectedEntry) {
            focusSelected();
            const sizeThreshold = interval / 20;
            if (resizing === "start") {
                const cleanedStart = Math.round(Math.min(currentAnchorTime + snapDeltaStart, selectedEntry.end - sizeThreshold) * 1000) / 1000;
                onEntryResize?.(cleanedStart, selectedEntry.end);
            } else {
                const cleanedEnd = Math.round(Math.max(currentAnchorTime + snapDeltaEnd, selectedEntry.start + sizeThreshold) * 1000) / 1000;
                onEntryResize?.(selectedEntry.start, cleanedEnd);
            }
            setResizing(undefined);
        }
    }

    function handleKeyboardMove(delta: number) {
        const entry = selectedEntry;
        if (!entry) return;
        onEntryMove?.(delta);
        focusSelected();
        setCurrentTime(entry.start + delta);
    }

    function getSnappingEntry(entry: TimelineEntryData, end: boolean) {
        if (!entries) return;
        const sorted = entries.sort((a, b) => (end ? a.end - b.end : a.start - b.start));
        const thisEntry = sorted.findIndex(e => e.symbol === entry.symbol);
        if (thisEntry === -1) return;
        const closest = end ? thisEntry + 1 : thisEntry - 1;
        if (closest < 0 || closest >= sorted.length) return;
        const closestEntry = sorted[closest];
        return closestEntry;
    }

    function handleKeyboardSnap(end: boolean) {
        const entry = selectedEntry;
        if (!entry) return;
        // find the closest entry in the direction
        const closestEntry = getSnappingEntry(entry, end);
        if (!closestEntry) return;
        const delta = end ? closestEntry.start - entry.end : closestEntry.end - entry.start;
        onEntryMove?.(delta);
    }

    function handleKeyboardResize(e: React.KeyboardEvent, end: boolean, shrink = false) {
        const entry = selectedEntry;
        if (!entry) return;
        e.preventDefault();
        e.stopPropagation();
        const delta = Math.round(Math.max(0.001, interval / 50) * 1000) / 1000;
        const sizeThreshold = interval / 20;
        if (end) {
            onEntryResize?.(entry.start, shrink ? Math.max(entry.start + sizeThreshold, entry.end - delta) : entry.end + delta);
        } else {
            onEntryResize?.(shrink ? Math.min(entry.start + delta, entry.end - sizeThreshold) : entry.start - delta, entry.end);
        }
    }

    function handleKeyboardResizeSnap(e: React.KeyboardEvent, end: boolean) {
        const entry = selectedEntry;
        if (!entry) return;
        e.preventDefault();
        e.stopPropagation();
        const closestEntry = getSnappingEntry(entry, end);
        if (!closestEntry) return;
        if (end) {
            onEntryResize?.(entry.start, closestEntry.start);
        } else {
            onEntryResize?.(closestEntry.end, entry.end);
        }
    }

    return <>
        {labelComponent}
        <TimelineOverflowContainer 
            ref={containerRef}
            onMouseDown={e => {
                if (e.button !== 0) return;
                handleInteractionDown(e.clientX);
            }}
            onTouchStart={e => {
                const touch = e.touches[0];
                if (!touch) return;
                handleInteractionDown(touch.clientX);
            }}
            onMouseMove={e => {
                handleInteractionCursor(e.clientX);
                if (!(dragging || moving || resizing)) return;
                focusSelected();
                setCurrentAnchor(e.clientX);
            }}
            onTouchMove={e => {
                const touch = e.touches[0];
                if (!touch) return;
                if (!(dragging || moving || resizing)) return;
                focusSelected();
                setCurrentAnchor(touch.clientX);
            }}
            onMouseUp={handleInteractionEnd}
            onMouseLeave={handleInteractionEnd}
            onMouseEnter={handleInteractionEnd}
            onTouchEnd={handleInteractionEnd}
            style={{
                '--lines': Math.max(0, maxDepth),
                cursor: interactionCursor
            } as CSSProperties}
        >
            <PlayheadLine />
            <div 
                className={typeof styling?.timelineTrackTape === 'string' ? styling.timelineTrackTape : undefined} 
                style={{
                    ...(typeof styling?.timelineTrackTape === 'string' ? {} : styling?.timelineTrackTape),
                    width: `${duration / interval * 8}rem`,
                    transform: `translateX(calc(${(containerWidth ?? 0) / 2}px - ${(currentTime / duration) * (trackWidth ?? 0)}px))`,
                    position: 'relative',
                    height: 'calc(100% - 1rem)',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem'
                }} 
                ref={trackRef}
            >
            {
                sentries ? sentries.map((entry, i) => {
                    const { start, end, content, _draft } = entry;
                    const ChosenTimelineElement = _draft === "draft" ? DraftElement : _draft === "selection" ? DragElement : TimelineElement;
                    const selected = !!selectedEntry?.symbol && (selectedEntry?.symbol === entry.symbol);

                    const disabled = !selected && interactionCursor === "ew-resize";
                    
                    return <ChosenTimelineElement 
                        key={_draft ?? i} 
                        style={{
                            width: `${(end - start) / duration * 100}%`,
                            left: `${(start / duration) * 100}%`,
                            top: `calc(${depthMap[i]! * 40}px - ${depthMap[i]! * 0.5}rem)`,
                            cursor: interactionCursor === "default" ? undefined : interactionCursor,
                        }}
                        onFocus={!_draft ? e => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (containerRef.current)
                                containerRef.current.scrollLeft = 0;
                            setPlaying(false);
                            if (disabled) {
                                return focusSelected();
                            } 
                            !(moving || resizing) && !(selectedRef.current === document.activeElement) && setCurrentTime(entry.start);
                            onEntrySelect?.(entry);
                        } : undefined}
                        onKeyDown={!_draft ? e => {
                            const delta = Math.max(0.001, interval / 50);
                            const meta = e.ctrlKey || e.metaKey;

                            if (meta && e.shiftKey && e.key === 'ArrowLeft') return handleKeyboardResizeSnap(e, false);
                            if (meta && e.shiftKey && e.key === 'ArrowRight') return handleKeyboardResizeSnap(e, true);

                            if (e.altKey && e.key === 'ArrowLeft') return handleKeyboardResize(e, true, true);
                            if (e.altKey && e.key === 'ArrowRight') return handleKeyboardResize(e, false, true);
                            
                            if (meta && e.key === 'ArrowLeft') return handleKeyboardResize(e, false);
                            if (meta && e.key === 'ArrowRight') return handleKeyboardResize(e, true);

                            if (e.shiftKey && e.key === 'ArrowLeft') return handleKeyboardSnap(false);
                            if (e.shiftKey && e.key === 'ArrowRight') return handleKeyboardSnap(true);
                            
                            if (e.key === 'ArrowLeft') return handleKeyboardMove(-delta);
                            if (e.key === 'ArrowRight') return handleKeyboardMove(delta);
                            
                            if (e.key === 'Backspace' || e.key === 'Delete') return handleEntryDelete?.();
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                return onEntryEdit?.(entry);
                            }
                        } : undefined}
                        tabIndex={!_draft && !disabled ? 0 : -1}
                        selected={selected}
                        data-timeline-selected={selected ? "true" : "false"}
                        data-timeline-sentry-index={i}
                        ref={selected ? selectedRef : undefined}
                    >
                        {content}
                    </ChosenTimelineElement>
                }) : undefined
            }
            </div>
        </TimelineOverflowContainer>
    </>
}