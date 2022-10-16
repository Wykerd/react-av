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
    #id: string;
    get id() {
        return this.#id;
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
        this.#mode = mode;
    }
    #cues?: TextTrackCue[];
    get cues() {
        return this.#cues;
    }
    // get activeCues() {
        // TODO
        // return this.#cues;
    // }


    #regions: VTTRegion[] = [];
    // XXX: this is non-standard
    get _regions() {
        return this.#regions;
    }

    addCue(cue: TextTrackCue) {
        if (this.#cues) {
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

    constructor(kind: TextTrackKind, label: string, language: string, isBandMetadataTrackDispatchType: boolean, mode: TextTrackMode, id: string, regions?: VTTRegion[]) {
        super();
        this.#kind = kind;
        this.#label = label;
        this.#language = language;
        this.#isBandMetadataTrackDispatchType = isBandMetadataTrackDispatchType;
        this.#mode = mode;
        this.#id = id;
        this.#regions = regions || [];
    }

    // TODO: oncuechange
}