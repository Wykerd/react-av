import { getCueContext } from "./GlobalState";
import { TextTrackCue } from "./VTTCue";

export type TextTrackKind = "subtitles" |  "captions" |  "descriptions" |  "chapters" | "metadata";
export type TextTrackMode = "disabled" | "hidden" | "showing";

// TODO: make this spec compliant
export default class TextTrack extends EventTarget {
    #kind: TextTrackKind;
    get kind() {
        return this.#kind;
    }
    #label: string;
    get label() {
        return this.#label;
    }
    #language: string;
    get language() {
        return this.#language;
    }
    #id?: string;
    get id() {
        return this.#id || "";
    }
    #isBandMetadataTrackDispatchType: boolean;
    get inBandMetadataTrackDispatchType() {
        return this.#isBandMetadataTrackDispatchType;
    }
    #mode: TextTrackMode;
    get mode() {
        return this.#mode;
    }
    set mode(mode: TextTrackMode) {
        if (!["disabled", "hidden", "showing"].includes(mode)) return;
        this.#mode = mode;
    }
    #cues?: TextTrackCue[];
    get cues() {
        return this.#cues;
    }
    get activeCues() {
        return this.#cues?.filter(cue => getCueContext(cue)?.active);
    }

    #regions: VTTRegion[] = [];
    // XXX: this is non-standard
    get _regions() {
        return this.#regions;
    }

    addCue(cue: TextTrackCue) {
        if (this.#cues) {
            if (this.#cues.includes(cue)) {
                // remove the old cue
                this.removeCue(cue);
            }
            this.#cues.push(cue);
        } else {
            this.#cues = [cue];
        }
    }

    removeCue(cue: TextTrackCue) {
        if (this.#cues) {
            const index = this.#cues.indexOf(cue);
            if (index > -1) {
                this.#cues.splice(index, 1);
            } else {
                throw new DOMException("The cue does not exist in the track", "NotFoundError");
            }
        }
    }

    _addRegion(region: VTTRegion) {
        this.#regions.push(region);
    }

    _removeRegion(region: VTTRegion) {
        const index = this.#regions.indexOf(region);
        if (index > -1) {
            this.#regions.splice(index, 1);
        }
    }

    constructor(kind: TextTrackKind, mode?: TextTrackMode, label?: string, language?: string, id?: string, isBandMetadataTrackDispatchType?: boolean, regions?: VTTRegion[]) {
        super();
        this.#kind = kind ? ["subtitles", "captions", "descriptions", "chapters", "metadata"].includes(kind) ? kind : "metadata" : "subtitles";
        this.#label = label || "";
        this.#language = language || "";
        this.#isBandMetadataTrackDispatchType = !!isBandMetadataTrackDispatchType;
        this.#mode = mode || "hidden";
        this.#id = id;
        this.#regions = regions || [];
    }

    // TODO: oncuechange
}