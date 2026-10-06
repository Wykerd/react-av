// When the current playback position of a media element changes (e.g. due to playback or seeking), the user agent must run the time marches on steps. To support use cases that depend on the timing accuracy of cue event firing, such as synchronizing captions with shot changes in a video, user agents should fire cue events as close as possible to their position on the media timeline, and ideally within 20 milliseconds. If the current playback position changes while the steps are running, then the user agent must wait for the steps to complete, and then must immediately rerun the steps. These steps are thus run as often as possible or needed.

import TextTrack from "./TextTrack";
import { TextTrackCue } from "./VTTCue";
import WebVTTUpdateTextTracksDisplay from "./VTTRenderer";

export type TextTrackChangedCallback = (element: HTMLMediaElement, track?: TextTrack) => void;
export type TextTrackUpdateRule = (element: HTMLMediaElement, affectedTracks: TextTrack[]) => void;

export interface TextTrackContext {
    refcount: number;
    tracks: TextTrack[];
    tracksChanged: EventTarget;
    lastTimestamp?: number;
    newlyIntroducedCues: Set<TextTrackCue>;
    updateRules: Set<TextTrackUpdateRule>;
}

export interface TextTrackCueContext {
    active: boolean;
    displayState?: HTMLElement;
}

const trackContext = new Map<HTMLMediaElement, TextTrackContext>();
const cueContext = new Map<TextTrackCue, TextTrackCueContext>();

export function getContext(element: HTMLMediaElement) {
    return trackContext.get(element);
}

export function getCueContext(cue: TextTrackCue) {
    return cueContext.get(cue);
}

export function setCueDisplayState(cue: TextTrackCue, state: HTMLElement) {
    const ctx = getCueContext(cue);
    if (ctx) {
        ctx.displayState = state;
    } else {
        cueContext.set(cue, { active: false, displayState: state });
    }
}

const observer = globalThis?.ResizeObserver ? new ResizeObserver((entries) => {
    for (const entry of entries) {
        if (trackContext.has(entry.target as HTMLMediaElement)) {
            entry.target.nodeName === "VIDEO" && WebVTTUpdateTextTracksDisplay(entry.target as HTMLVideoElement, true);
        }
    }
}) : undefined;

export function defaultUpdateRule(element: HTMLMediaElement, affectedTracks: TextTrack[]) {
    element.nodeName === "VIDEO" && WebVTTUpdateTextTracksDisplay(element as HTMLVideoElement);
}

export function observeResize(element: HTMLMediaElement) {
    const tracks = trackContext.get(element);
    if (tracks !== undefined) {
        observer?.observe(element);
    }
}

export function unobserveResize(element: HTMLMediaElement) {
    observer?.unobserve(element);
}

export function init(element: HTMLMediaElement) {
    trackContext.set(element, {
        refcount: 0,
        tracks: [],
        tracksChanged: new EventTarget(),
        lastTimestamp: undefined,
        newlyIntroducedCues: new Set(),
        updateRules: new Set([defaultUpdateRule])
    });

    return trackContext.get(element)!;
}

export function deinit(element: HTMLMediaElement) {
    observer?.unobserve(element);
    trackContext.delete(element);
}

export function ref(element: HTMLMediaElement) {
    const context = trackContext.get(element);
    if (!context) init(element);
    trackContext.get(element)!.refcount++;
}

export function deref(element: HTMLMediaElement) {
    const context = trackContext.get(element);
    if (!context) return;
    context.refcount--;
    if (context.refcount === 0) deinit(element);
}

export function addTrack(element: HTMLMediaElement, track: TextTrack) {
    const context = trackContext.get(element);
    if (!context) return;
    context.tracks.push(track);
    
    context.tracksChanged.dispatchEvent(new CustomEvent("change", {
        detail: context
    }));
}

export function removeTrack(element: HTMLMediaElement, track: TextTrack) {
    const context = trackContext.get(element);
    if (!context) return;

    const index = context.tracks.indexOf(track);
    if (index >= 0) {
        context.tracks.splice(index, 1);
    }

    context.tracksChanged.dispatchEvent(new CustomEvent("change", {
        detail: context
    }));
}

export function addTextTrack(element: HTMLMediaElement, kind: TextTrackKind, label?: string, language?: string) {
    const track = new TextTrack(kind, "hidden", label, language);
    addTrack(element, track);
    return track;
}

export function getTrackById(element: HTMLMediaElement, id: string) {
    if (id === "") return undefined;
    const context = trackContext.get(element);
    if (!context) return;
    return context.tracks.find(track => track.id === id);
}

export function getCueById(element: HTMLMediaElement, id: string) {
    const context = trackContext.get(element);
    if (!context) return;
    for (const track of context.tracks) {
        const cue = track.cues?.find(cue => cue.id === id);
        if (cue) return cue;
    }
}

if (globalThis?.window) {
    function timeLoop() {
        timeMarchesOn();
        window.requestAnimationFrame(timeLoop);
    }
    timeLoop();
}

export function updateTextTrackDisplay(element: HTMLMediaElement, affectedTracks: TextTrack[]) {
    const context = trackContext.get(element);
    if (!context) return;
    context.updateRules.forEach((value) => {
        value(element, affectedTracks);
    });
}

export function timeMarchesOn() {
    for (const [element, context] of trackContext) {
        const lastTimestamp = context.lastTimestamp;
        if (element.currentTime === lastTimestamp) continue;
        context.lastTimestamp = element.currentTime;
        const textTrackList = context.tracks;
        if (!textTrackList) continue;
        // 1. Let current cues be a list of cues, initialized to contain all the cues of all the hidden or showing text tracks of the media element (not the disabled ones) whose start times are less than or equal to the current playback position and whose end times are greater than the current playback position.
        const currentCues = Array.from(textTrackList)
            .filter(track => track.mode === "showing" || track.mode === "hidden")
            .flatMap(track => Array.from(track.cues || [])
                .filter(cue => cue.startTime <= element.currentTime && cue.endTime > element.currentTime)
            );
        // 2. Let other cues be a list of cues, initialized to contain all the cues of hidden and showing text tracks of the media element that are not present in current cues.
        const otherCues = Array.from(textTrackList)
            .filter(track => track.mode === "showing" || track.mode === "hidden")
            .flatMap(track => Array.from(track.cues || [])
                .filter(cue => !currentCues.includes(cue)));
        // 3. Let last time be the current playback position at the time this algorithm was last run for this media element, if this is not the first time it has run.
        const lastTime = lastTimestamp;
        // 4. If the current playback position has, since the last time this algorithm was run, only changed through its usual monotonic increase during normal playback, then let missed cues be the list of cues in other cues whose start times are greater than or equal to last time and whose end times are less than or equal to the current playback position. Otherwise, let missed cues be an empty list.
        // XXX: to detect monotonic increase, we check if the last time run is within the range of 40ms.
        let missedCues = !lastTime || lastTime - element.currentTime > 40 || !lastTime  ? [] : otherCues.filter(cue => {
            return cue.startTime >= lastTime && cue.endTime <= element.currentTime;
        });
        // 5. Remove all the cues in missed cues that are also in the media element's list of newly introduced cues, and then empty the element's list of newly introduced cues.
        const newlyIntroducedCues = context.newlyIntroducedCues;
        if (newlyIntroducedCues) {
            missedCues = missedCues.filter(cue => !newlyIntroducedCues.has(cue));
            newlyIntroducedCues.clear();
        }
        // 6. If the time was reached through the usual monotonic increase of the current playback position during normal playback, and if the user agent has not fired a timeupdate event at the element in the past 15 to 250ms and is not still running event handlers for such an event, then the user agent must queue a media element task given the media element to fire an event named timeupdate at the element. (In the other cases, such as explicit seeks, relevant events get fired as part of the overall process of changing the current playback position.)
        // XXX: this is handled by the media element implementation. Our implementation only concerns itself with the cue events.
        // 7. If all of the cues in current cues have their text track cue active flag set, none of the cues in other cues have their text track cue active flag set, and missed cues is empty, then return.
        if (currentCues.every(cue => cueContext.get(cue)?.active) && otherCues.every(cue => !cueContext.get(cue)?.active) && missedCues.length === 0) 
            continue;
        // 8. If the time was reached through the usual monotonic increase of the current playback position during normal playback, and there are cues in other cues that have their text track cue pause-on-exit flag set and that either have their text track cue active flag set or are also in missed cues, then immediately pause the media element.
        if ((!lastTime || lastTime - element.currentTime > 40) && otherCues.some(cue => cue.pauseOnExit && (cueContext.get(cue)?.active || missedCues.includes(cue)))) {
            element.pause();
        }
        // 9. Let events be a list of tasks, initially empty. Each task in this list will be associated with a text track, a text track cue, and a time, which are used to sort the list before the tasks are queued.
        const events: { name: string, track: TextTrack, target: TextTrackCue, time: number }[] = [];
        // Let affected tracks be a list of text tracks, initially empty.
        let affectedTracks: TextTrack[] = [];
        // When the steps below say to prepare an event named event for a text track cue target with a time time, the user agent must run these steps:
        function prepareEvent(event: string, target: TextTrackCue, time: number) {
            // 1. Let track be the text track with which the text track cue target is associated.
            const track = target.track;
            if (!track) return;
            // 2. Create a task to fire an event named event at target.
            // 3. Add the newly created task to events, associated with the time time, the text track track, and the text track cue target.
            events.push({ name: event, track, target, time });
            // 4. Add track to affected tracks.
            affectedTracks.push(track);
        }
        // 10. For each text track cue in missed cues, prepare an event named enter for the TextTrackCue object with the text track cue start time.
        missedCues.forEach(cue => prepareEvent("enter", cue, cue.startTime));
        // 11. For each text track cue in other cues that either has its text track cue active flag set or is in missed cues, prepare an event named exit for the TextTrackCue object with the later of the text track cue end time and the text track cue start time.
        otherCues.filter(cue => cueContext.get(cue)?.active || missedCues.includes(cue)).forEach(cue => prepareEvent("exit", cue, Math.max(cue.endTime, cue.startTime)));
        // 12. For each text track cue in current cues that does not have its text track cue active flag set, prepare an event named enter for the TextTrackCue object with the text track cue start time.
        currentCues.filter(cue => !cueContext.get(cue)?.active).forEach(cue => prepareEvent("enter", cue, cue.startTime));
        // 13. Sort the tasks in events in ascending time order (tasks with earlier times first).
        // Further sort tasks in events that have the same time by the relative text track cue order of the text track cues associated with these tasks.
        // Finally, sort tasks in events that have the same time and same text track cue order by placing tasks that fire enter events before those that fire exit events.
        events.sort((a, b) => { 
            if (a.time !== b.time) return a.time - b.time;
            // XXX: this is not entirely correct, as the spec says to first group by track before sorting by cue order.
            if (a.target.startTime !== b.target.startTime) return a.target.startTime - b.target.startTime;
            // end time latest first
            if (a.target.endTime !== b.target.endTime) return b.target.endTime - a.target.endTime;
            // XXX: we are not sorting by order added to track, as we don't have that information.
            if (a.name === "enter" && b.name === "exit") return -1;
            if (a.name === "exit" && b.name === "enter") return 1;
            return 0;
        });
        // 14. Queue a media element task given the media element for each task in events, in list order.
        // TODO: this is likely wrong event, we're disregarding the time and track information.
        events.forEach(event => {
            // TODO: event.target.dispatchEvent(new Event(event.name));
        });
        // 15. Sort affected tracks in the same order as the text tracks appear in the media element's list of text tracks, and remove duplicates.
        const trackOrder = Array.from(textTrackList);
        affectedTracks = [...new Set(affectedTracks)].sort((a, b) => trackOrder.indexOf(a) - trackOrder.indexOf(b));
        // 16. For each text track in affected tracks, in the list order, queue a media element task given the media element to fire an event named cuechange at the TextTrack object, and, if the text track has a corresponding track element, to then fire an event named cuechange at the track element as well.
        affectedTracks.forEach(track => {
            // TODO: track.dispatchEvent(new Event("cuechange"));
            // XXX: we do not support html element tracks.
        });
        // 17. Set the text track cue active flag of all the cues in the current cues, and unset the text track cue active flag of all the cues in the other cues.
        currentCues.forEach(cue => {
            const context = cueContext.get(cue);
            if (context) context.active = true;
            else cueContext.set(cue, { active: true, displayState: undefined });
        });
        otherCues.forEach(cue => {
            const context = cueContext.get(cue);
            if (context) {
                context.active = false;
                context.displayState = undefined;
            } else {
                cueContext.set(cue, { active: false, displayState: undefined });
            }
        });
        // 18. Run the rules for updating the text track rendering of each of the text tracks in affected tracks that are showing, providing the text track's text track language as the fallback language if it is not the empty string. For example, for text tracks based on WebVTT, the rules for updating the display of WebVTT text tracks. [WEBVTT]
        // TODO: use affected tracks
        updateTextTrackDisplay(element, affectedTracks);
    }
}
