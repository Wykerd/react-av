import * as Media from '@react-av/core';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import VTT, { TextTrack, VTTCue } from "@react-av/vtt-core";
import { useMediaTextTrackList } from "@react-av/vtt";
import { TimelineTrack } from "./TimelineTrack";
import { ClosedCaptioning } from "@phosphor-icons/react";
import { useTimelineEditorContext } from './TimelineEditor';
import { TimelineEntryLabel } from './TimelineEntryLabel';

// this is a special version of useMediaTextTrack hook that tracks start and end time changes for resizes of cues
interface TimeKeyedCue {
    start: number;
    end: number;
    cue: VTTCue;
}
function useMediaTextTrack2(id: string) {
    const media = Media.useMediaElement();

    const [activeCues, setActiveCues] = useState<TimeKeyedCue[]>([]);
    const [cues, setCues] = useState<TimeKeyedCue[]>([]);

    useEffect(() => {
        if (!media) return;
        VTT.ref(media);
        function update() {
            if (!media) return;
            const track = VTT.getTrackById(media, id);
            if (!track) return;
            const cues = track.cues;
            if (!cues) return;
            const orderedCues = cues.sort((a, b) => {
                if (a.startTime === b.startTime)
                    return b.endTime - a.endTime;
                return a.startTime - b.startTime;
            });
            const activeCues = orderedCues.filter(cue => cue.startTime <= media.currentTime && cue.endTime > media.currentTime);
            setCues(orderedCues.map(cue => ({ cue: cue as VTTCue, start: cue.startTime, end: cue.endTime })));
            setActiveCues(activeCues.map(cue => ({ cue: cue as VTTCue, start: cue.startTime, end: cue.endTime })));
        }

        VTT.getContext(media)?.tracksChanged.addEventListener("change", update);
        VTT.getContext(media)?.tracksChanged.addEventListener("cuechange", update);
        VTT.getContext(media)?.updateRules.add(update);
        update();

        return () => {
            VTT.getContext(media)?.tracksChanged.removeEventListener("change", update);
            VTT.getContext(media)?.tracksChanged.removeEventListener("cuechange", update);
            VTT.getContext(media)?.updateRules.delete(update);
            VTT.deref(media);
        }
    }, [media, id]);

    return [cues, activeCues] as const;
}

interface CueState {
    startTime: number,
    endTime: number,
    text: string
}

interface CueHistoryEntry {
    cue: VTTCue,
    before?: CueState,
    after?: CueState,
    isTextEdit: boolean
}

interface CueHistory {
    past: CueHistoryEntry[],
    future: CueHistoryEntry[]
}

const HISTORY_LIMIT = 100;
const EMPTY_HISTORY: CueHistory = { past: [], future: [] };

function isSameCueState(first?: CueState, second?: CueState) {
    return first?.startTime === second?.startTime && first?.endTime === second?.endTime && first?.text === second?.text;
}

export interface TimelineSubtitleCueEditorContextValue {
    entry?: VTTCue,
    focusRef: React.RefObject<HTMLDivElement | null>,
    deselect: () => void,
    delete: () => void,
    focusTimeline: () => void,
    setText: (text: string) => void,
    finishTextEdit: () => void,
    // update cue display and notify of changes
    sync: () => void
}

const TimelineSubtitleCueEditorContext = createContext<TimelineSubtitleCueEditorContextValue | null>(null);

export function useTimelineSubtitleCueEditor() {
    const context = useContext(TimelineSubtitleCueEditorContext);
    if (!context) throw new Error("useTimelineSubtitleCueEditor must be used within a TimelineSubtitlesTrack component");
    return context;
}

export interface TimelineSubtitleTrackContextValue {
    track?: TextTrack,
    sync: () => void,
    clear: () => void,
    undo: () => void,
    redo: () => void,
    canUndo: boolean,
    canRedo: boolean
}

const TimelineSubtitleTrackContext = createContext<TimelineSubtitleTrackContextValue | null>(null);

export function useTimelineSubtitleTrack() {
    const context = useContext(TimelineSubtitleTrackContext);
    if (!context) throw new Error("useTimelineSubtitleTrack must be used within a TimelineSubtitlesTrack component");
    return context;
}

export interface TimelineSubtitlesTrackProps { 
    snap?: boolean, 
    id?: string,
    onTrackCuesChanged?: (track: TextTrack) => unknown,
    children?: React.ReactNode,
    labelComponent?: React.ReactElement
}

export function TimelineSubtitlesTrack({ 
    id: defaultID, 
    snap,
    onTrackCuesChanged,
    children,
    labelComponent
}: TimelineSubtitlesTrackProps) {
    const { timelineInterval: interval } = useTimelineEditorContext();

    const textTrackList = useMediaTextTrackList();
    const element = Media.useMediaElement();
    const id = useMemo(() => defaultID ?? "__reactav__draft", [defaultID]);
    const [cues] = useMediaTextTrack2(id);
    const [selectedEntry, setSelectedEntry] = useState<VTTCue>();
    const [history, setHistory] = useState(EMPTY_HISTORY);
    const typingCue = useRef<VTTCue | undefined>(undefined);
    const selectedRef = useRef<HTMLDivElement>(null);
    const propertiesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!element) return;
        VTT.ref(element);
        return () => {
            VTT.deref(element);
        }
    }, [element]);

    const entries = useMemo(() => {
        return cues.map(cue => ({
            start: cue.start,
            end: cue.end,
            content: cue.cue.text,
            symbol: cue.cue
        }));
    }, [cues]);

    useEffect(() => {
        if (!element) return;
        if (!defaultID) {
            const track = new TextTrack("subtitles", "showing", "English", "en", id);
            VTT.addTrack(element, track);
            return () => VTT.removeTrack(element, track);
        }
    }, [element, defaultID, id]);

    const currentTrack = useMemo(() => {
        if (!textTrackList) return undefined;
        return textTrackList.find(track => track.id === id);
    }, [textTrackList, id]);

    useEffect(() => {
        setHistory(EMPTY_HISTORY);
        typingCue.current = undefined;
    }, [currentTrack]);

    function forceRefresh() {
        element && VTT.getContext(element)?.tracksChanged.dispatchEvent(new CustomEvent("cuechange", {
            detail: currentTrack
        }));
        VTT.getContext(element!)!.lastTimestamp = undefined;
        element && currentTrack && VTT.updateTextTrackDisplay(element, [currentTrack]);
        // TODO: toVTT should be feature complete, i.e. it should include positioning regions etc.
        onTrackCuesChanged && currentTrack && onTrackCuesChanged(currentTrack);
    }

    function handleCueDelete() {
        if (!selectedEntry) return;
        const before = readCueState(selectedEntry);
        const cue = selectedEntry;
        console.log(currentTrack);
        currentTrack?.removeCue(cue);
        recordCueChange(cue, before);
        setSelectedEntry(undefined);
        forceRefresh();
    }

    function handleEraseSubtitles() {
        if (!currentTrack) return;
        const cues = currentTrack.cues;
        if (!cues) return;
        const oldCues = [...cues];
        for (const cue of oldCues) {
            currentTrack.removeCue(cue);
        }
        setHistory(EMPTY_HISTORY);
        forceRefresh();
    }

    function readCueState(cue: VTTCue): CueState | undefined {
        if (!currentTrack?.cues?.includes(cue)) return undefined;
        return { startTime: cue.startTime, endTime: cue.endTime, text: cue.text };
    }

    function applyCueState(cue: VTTCue, state?: CueState) {
        if (!currentTrack) return;
        const isInTrack = !!currentTrack.cues?.includes(cue);
        if (!state) {
            if (isInTrack) currentTrack.removeCue(cue);
            return;
        }
        cue.startTime = state.startTime;
        cue.endTime = state.endTime;
        cue.text = state.text;
        if (!isInTrack) currentTrack.addCue(cue);
    }

    function recordCueChange(cue: VTTCue, before: CueState | undefined, isTextEdit = false) {
        const after = readCueState(cue);
        if (isSameCueState(before, after)) return;
        const previousTypingCue = typingCue.current;
        typingCue.current = isTextEdit ? cue : undefined;
        setHistory(previous => {
            const lastEntry = previous.past[previous.past.length - 1];
            const continuesTyping = isTextEdit && previousTypingCue === cue && previous.future.length === 0 && lastEntry?.isTextEdit && lastEntry.cue === cue;
            if (continuesTyping) {
                return { past: [...previous.past.slice(0, -1), { ...lastEntry, after }], future: [] };
            }
            const entry: CueHistoryEntry = { cue, before, after, isTextEdit };
            return { past: [...previous.past, entry].slice(-HISTORY_LIMIT), future: [] };
        });
    }

    function undo() {
        const entry = history.past[history.past.length - 1];
        if (!entry) return;
        typingCue.current = undefined;
        applyCueState(entry.cue, entry.before);
        setHistory({ past: history.past.slice(0, -1), future: [...history.future, entry] });
        setSelectedEntry(entry.before ? entry.cue : undefined);
        forceRefresh();
    }

    function redo() {
        const entry = history.future[history.future.length - 1];
        if (!entry) return;
        typingCue.current = undefined;
        applyCueState(entry.cue, entry.after);
        setHistory({ past: [...history.past, entry], future: history.future.slice(0, -1) });
        setSelectedEntry(entry.after ? entry.cue : undefined);
        forceRefresh();
    }

    function handleHistoryShortcut(event: React.KeyboardEvent) {
        const target = event.target as HTMLElement;
        if (target.isContentEditable || target.matches("input, textarea")) return;
        if (event.altKey || (!event.metaKey && !event.ctrlKey)) return;
        const key = event.key.toLowerCase();
        if (key === "z" && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            undo();
        } else if ((key === "z" && event.shiftKey) || (key === "y" && event.ctrlKey)) {
            event.preventDefault();
            event.stopPropagation();
            redo();
        }
    }

    return <div style={{ display: "contents" }} onKeyDown={handleHistoryShortcut}>
    <TimelineSubtitleTrackContext.Provider value={{
        track: currentTrack,
        sync: forceRefresh,
        clear: handleEraseSubtitles,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0
    }}>
        <TimelineTrack 
            labelComponent={
                labelComponent ?? 
                <TimelineEntryLabel 
                    icon={<ClosedCaptioning size={21} weight='fill' />} 
                    label="Subtitles"
                />
            }
            selectedRef={selectedRef}
            onDraftCreate={entry => {
                const start = Math.round(entry.start * 1000) / 1000;
                const end = Math.round(entry.end * 1000) / 1000;
                // if start is within 20ms of end, do nothing
                if (Math.abs(start - end) < interval / 20) return;
                if (!currentTrack) return;
                const cue = new VTTCue(start, end, "New Subtitle");
                currentTrack.addCue(cue);
                recordCueChange(cue, undefined);
                forceRefresh();
                setSelectedEntry(cue);
            }}
            onEntryMove={delta => {
                if (!selectedEntry) return;
                const cue = selectedEntry;
                const before = readCueState(cue);
                cue.startTime += delta;
                cue.endTime += delta;
                if (cue.startTime < 0) {
                    const diff = cue.startTime;
                    cue.startTime = 0;
                    cue.endTime -= diff;
                }
                recordCueChange(cue, before);
                forceRefresh();
            }}
            entries={entries}
            onEntrySelect={entry => {
                setSelectedEntry(entry && entry.symbol as VTTCue);
            }}
            onEntryDelete={handleCueDelete}
            onEntryEdit={() => {
                propertiesRef.current?.querySelector("textarea")?.focus();
            }}
            onEntryResize={(start, end) => {
                if (!selectedEntry) return;
                const cue = selectedEntry;
                const before = readCueState(cue);
                cue.startTime = start;
                cue.endTime = end;
                recordCueChange(cue, before);
                forceRefresh();
            }}
            selectedSymbol={selectedEntry}
            snap={snap}
        />
        <TimelineSubtitleCueEditorContext.Provider value={{
            entry: selectedEntry,
            focusRef: propertiesRef,
            deselect: () => setSelectedEntry(undefined),
            delete: () => {
                handleCueDelete();
                setSelectedEntry(undefined);
                (selectedRef.current?.nextElementSibling as HTMLElement)?.focus();
            },
            focusTimeline: () => selectedRef.current?.focus(),
            setText: text => {
                if (!selectedEntry) return;
                const before = readCueState(selectedEntry);
                selectedEntry.text = text;
                recordCueChange(selectedEntry, before, true);
                forceRefresh();
            },
            finishTextEdit: () => { typingCue.current = undefined; },
            sync: forceRefresh
        }}>
        {
            children
        }
        </TimelineSubtitleCueEditorContext.Provider>
    </TimelineSubtitleTrackContext.Provider>
    </div>
}