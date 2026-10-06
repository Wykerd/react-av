import { addTrack, getContext, init, removeTrack, updateTextTrackDisplay } from "./GlobalState";
import TextTrack from "./TextTrack";
import VTTParser from "./VTTParser";

export interface HTMLTrackElementAttributes {
    kind?: TextTrackKind;
    src: string;
    srclang?: string;
    label?: string;
    default?: boolean;
    id?: string;
}

/**
 * Similar to the HTMLTrackElement, but for use in JS only. (Thus not a DOM element.)
 */
export class Track {
    kind: TextTrackKind;
    src: URL;
    srclang: string;
    label: string;
    default: boolean;
    #track: TextTrack;
    #readyState: number = 0;
    #element: HTMLMediaElement;
    get readyState() {
        return this.#readyState;
    }
    #abortController = new AbortController();
    static NONE = 0;
    static LOADING = 1;
    static LOADED = 2;
    static ERROR = 3;
    constructor(element: HTMLMediaElement, attrs: HTMLTrackElementAttributes) {
        this.src = new URL(attrs.src.trim(), location.href);
        // XXX: we don't verify language tag
        this.srclang = attrs.srclang ? attrs.srclang.trim() : "";
        this.label = attrs.label ? attrs.label.trim() : "";
        this.default = !!attrs.default;
        this.#element = element;
        this.#track = new TextTrack(attrs.kind || "subtitles", this.default ? "showing" : "hidden", this.label, this.srclang, attrs.id);
        this.kind = this.#track.kind;
        addTrack(element, this.#track);
        this.#fetch();
    }
    async #fetch() {
        this.#readyState = Track.LOADING;
        try {
            const response = await fetch(this.src.href, {
                signal: this.#abortController.signal,
            });
            const text = await response.text();
            const parser = new VTTParser(text);
            for (const cue of parser.cues) {
                cue.track = this.#track;
                this.#track.addCue(cue);
                const context = getContext(this.#element);
                context?.newlyIntroducedCues.add(cue);
                context?.tracksChanged.dispatchEvent(new CustomEvent("cuechange", {
                    detail: this.#track
                }))
            }
            for (const region of parser.regions) {
                this.#track._addRegion(region);
            }
            this.#readyState = Track.LOADED;
        } catch (e) {
            console.error(e);
            this.#readyState = Track.ERROR;
        }
    }
    remove() {
        if (this.#readyState === Track.LOADING) 
            this.#abortController.abort();
        removeTrack(this.#element, this.#track);
    }
}

Object.defineProperty(Track, "NONE", { value: 0, writable: false, enumerable: true, configurable: false });
Object.defineProperty(Track, "LOADING", { value: 1, writable: false, enumerable: true, configurable: false });
Object.defineProperty(Track, "LOADED", { value: 2, writable: false, enumerable: true, configurable: false });
Object.defineProperty(Track, "ERROR", { value: 3, writable: false, enumerable: true, configurable: false });
