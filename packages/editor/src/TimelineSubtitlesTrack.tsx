import * as Media from '@react-av/core';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import VTT, { TextTrack, VTTCue } from "@react-av/vtt-core";
import { useMediaTextTrackList } from "@react-av/vtt";
import { TimelineTrack } from "./TimelineTrack";
import { ClosedCaptioning } from "phosphor-react";
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

export interface TimelineSubtitleCueEditorContextValue {
    entry?: VTTCue,
    focusRef: React.RefObject<HTMLDivElement>,
    deselect: () => void,
    delete: () => void,
    focusTimeline: () => void,
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
    clear: () => void
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
        const cue = selectedEntry;
        console.log(currentTrack);
        currentTrack?.removeCue(cue);
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
        forceRefresh();
    }

    return <TimelineSubtitleTrackContext.Provider value={{
        track: currentTrack,
        sync: forceRefresh,
        clear: handleEraseSubtitles
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
                currentTrack?.addCue(cue);
                forceRefresh();
                setSelectedEntry(cue);
            }}
            onEntryMove={delta => {
                if (!selectedEntry) return;
                const cue = selectedEntry;
                cue.startTime += delta;
                cue.endTime += delta;
                if (cue.startTime < 0) {
                    const diff = cue.startTime;
                    cue.startTime = 0;
                    cue.endTime -= diff;
                }
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
                cue.startTime = start;
                cue.endTime = end;
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
            sync: forceRefresh
        }}>
        {
            children
        }
        </TimelineSubtitleCueEditorContext.Provider>
    </TimelineSubtitleTrackContext.Provider>
}