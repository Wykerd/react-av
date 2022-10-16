import TextTrack from './TextTrack';
import WebVTTParseCueText, { WebVTTBold, WebVTTClass, WebVTTInternalNode, WebVTTItalic, WebVTTLanguage, WebVTTNode, WebVTTNodeList, WebVTTRuby, WebVTTRubyText, WebVTTText, WebVTTTimestamp, WebVTTUnderline, WebVTTVoice } from './VTTCueTextParser';
import VTTRegion from './VTTRegion';

export type DirectionSetting = "" | "lr" | "rl";
export type AutoKeyword = "auto";
export type LineAndPositionSetting = number | AutoKeyword;
export type LineAlignSetting = "start" | "center" | "end";
export type PositionAlignSetting = "line-left" | "center" | "line-right" | "auto";
export type AlignSetting = "start" | "center" | "end" | "left" | "right";

// TODO: make this spec compliant
export class TextTrackCue extends EventTarget {
    track: TextTrack | null = null;
    id: string = "";
    pauseOnExit: boolean = false;
    startTime: number = 0;
    endTime: number = 0;
}

export interface VTTCuePrimative extends TextTrackCue {
    region: VTTRegion | null;
    vertical: DirectionSetting;
    // indicating whether the line is an integer number of lines or a percentage of the dimension of the video. 
    // Set to true when lines are counted, false otherwise.
    // default: true
    snapToLines: boolean;
    // The line is set either as a number of lines, a percentage of the video viewport height or width, 
    // or as the special value auto, which means the offset is to depend on the other showing tracks.
    //
    // default: auto
    line: LineAndPositionSetting;
    lineAlign: LineAlignSetting;
    position: LineAndPositionSetting;
    positionAlign: PositionAlignSetting;
    size: number;
    align: AlignSetting;
    text: string;
}

export default interface VTTCue extends VTTCuePrimative {
    getCueAsHTML(): DocumentFragment;
}

export default class VTTCue implements VTTCue {
    id: string = "";
    pauseOnExit: boolean = false;
    startTime: number = 0;
    endTime: number = 0;
    region: VTTRegion | null = null;
    vertical: DirectionSetting = "";
    snapToLines: boolean = true;
    line: LineAndPositionSetting = "auto";
    lineAlign: LineAlignSetting = "start";
    position: LineAndPositionSetting = "auto";
    positionAlign: PositionAlignSetting = "auto";
    size: number = 100;
    align: AlignSetting = "center";
    text: string = "";

    constructor(startTime: number, endTime: number, text: string) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.text = text;
    }

    #internalNodeApplyDOMStyle(element: Element, node: WebVTTInternalNode) {
        if (node.classNames.length > 0) element.setAttribute('class', node.classNames.join(' '));
    }

    #parseCueTextToDOMTree(element: WebVTTNode): Node {
        // TODO: again, this might be optimized, its a massive if-else ladder
        if (element instanceof WebVTTNodeList) {
            const root = document.createDocumentFragment();
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        // XXX: not included is WebVTT Region Object, since it is seems illogical to include it here
        else if (element instanceof WebVTTClass) {
            const root = document.createElement('span');
            this.#internalNodeApplyDOMStyle(root, element);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTItalic) {
            const root = document.createElement('i');
            this.#internalNodeApplyDOMStyle(root, element);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTBold) {
            const root = document.createElement('b');
            this.#internalNodeApplyDOMStyle(root, element);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTUnderline) {
            const root = document.createElement('u');
            this.#internalNodeApplyDOMStyle(root, element);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTRuby) {
            const root = document.createElement('ruby');
            this.#internalNodeApplyDOMStyle(root, element);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTRubyText) {
            const root = document.createElement('rt');
            this.#internalNodeApplyDOMStyle(root, element);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTVoice) {
            const root = document.createElement('span');
            this.#internalNodeApplyDOMStyle(root, element);
            root.setAttribute('title', element.value);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTLanguage) {
            const root = document.createElement('span');
            this.#internalNodeApplyDOMStyle(root, element);
            root.setAttribute('lang', element.lang);
            for (const child of element.children) {
                root.appendChild(this.#parseCueTextToDOMTree(child));
            }
            return root;
        }
        else if (element instanceof WebVTTText) {
            return document.createTextNode(element.value);
        }
        else if (element instanceof WebVTTTimestamp) {
            return document.createProcessingInstruction('timestamp', toTimestampString(element.value));
        }
        // XXX: this should be unreachable
        throw new Error('Unreachable state reached');
    }

    getCueAsHTML(): DocumentFragment {
        const list = WebVTTParseCueText(this.text);
        return this.#parseCueTextToDOMTree(list) as DocumentFragment;
    }
}

export function toTimestampString(timestampSeconds: number) {
    const hours = Math.floor(timestampSeconds / 3600);
    const minutes = Math.floor(timestampSeconds / 60) % 60;
    const seconds = Math.floor(timestampSeconds % 60);
    const thousands = Math.floor((timestampSeconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${thousands.toString().padStart(3, '0')}`;
}