import { getContext, getCueContext, setCueDisplayState } from "./GlobalState";
import VTTCue, { toTimestampString } from "./VTTCue";
import WebVTTParseCueText, { WebVTTBold, WebVTTClass, WebVTTInternalNode, WebVTTItalic, WebVTTLanguage, WebVTTNode, WebVTTNodeList, WebVTTRuby, WebVTTRubyText, WebVTTText, WebVTTTimestamp, WebVTTUnderline, WebVTTVoice } from "./VTTCueTextParser";
import VTTRegion from "./VTTRegion";

// custom elements
import './renderer/TextTrackContainer';
import './renderer/TextTrackContainer';

const uiContainers = new Map<HTMLVideoElement, HTMLDivElement>();
const didShowUI = new Set<HTMLVideoElement>();

export function addUIContainer(video: HTMLVideoElement, container: HTMLDivElement) {
    uiContainers.set(video, container);
}

export function removeUIContainer(video: HTMLVideoElement) {
    uiContainers.delete(video);
}

/**
 * 
 * @param container 
 * @param video 
 * @param reset If the last time these rules were run, the user agent was not exposing a user interface for video, but now it is, optionally let reset be true. Otherwise, let reset be false.
 * @param ui exposed user interface over video
 * @param forceReset force reset - this is non-standard
 */
export default function WebVTTUpdateTextTracksDisplay( 
    video: HTMLVideoElement,
    forceReset: boolean = false,
) {
    const container = video.parentElement;
    const ui = uiContainers.get(video);
    // TODO: maybe add a fallback for when the video element is not in a container
    if (!container) return;
    container.style.position = "relative";
    let textTrackContainer = container.querySelector('vtt-texttrackcontainer') as HTMLElement | null;
    if (!textTrackContainer) {
        textTrackContainer = document.createElement('vtt-texttrackcontainer');
        textTrackContainer.style.position = 'absolute';
        container.append(textTrackContainer);
    }
    // make sure the container is positioned relative
    if (container.style.position !== "relative") 
        container.style.position = "relative";

    const containerRegion = container.getBoundingClientRect();
    const videoRegion = video.getBoundingClientRect();
    const viewHeight = videoRegion.height;
    const viewWidth = videoRegion.width;

    textTrackContainer.style.width = `${viewWidth}px`;
    textTrackContainer.style.height = `${viewHeight}px`;
    textTrackContainer.style.top = `${videoRegion.top - containerRegion.top}px`;
    textTrackContainer.style.left = `${videoRegion.left - containerRegion.left}px`;

    textTrackContainer.setAttribute('vheight', '' + viewHeight);
    // 3. Let output be an empty list of absolutely positioned CSS block boxes.
    // XXX: since this is a JavaScript implementation and we do not have direct access to the layout engine, we will use divs as CSS boxes as described in the spec.
    // XXX: we directly append to textTrackContainer, so we don't need to keep track of output
    textTrackContainer.innerHTML = '';
    // 4. If the user agent is exposing a user interface for video, add to output one or more completely transparent positioned CSS block boxes that cover the same region as the user interface.
    if (ui) {
        const region = ui.getBoundingClientRect();
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${region.left - videoRegion.left}px`;
        div.style.top = `${region.top - videoRegion.top}px`;
        div.style.width = `${region.width}px`;
        div.style.height = `${region.height}px`;
        div.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        textTrackContainer.append(div);
    }
    // 5. If the last time these rules were run, the user agent was not exposing a user interface for video, but now it is, optionally let reset be true. Otherwise, let reset be false.
    const reset = Boolean(!didShowUI.has(video) && ui) || forceReset;
    if (ui) didShowUI.add(video);
    else didShowUI.delete(video);
    // 6. Let tracks be the subset of video’s list of text tracks that have as their rules for updating the text track rendering these rules for updating the display of WebVTT text tracks, and whose text track mode is showing.
    const list = getContext(video)?.tracks;
    if (!list) return;
    const tracks = list.filter(track => track.mode === 'showing' && track);
    // 7. Let cues be an empty list of text track cues.
    let cues: VTTCue[] = [];
    // 8. For each track track in tracks, append to cues all the cues from track’s list of cues that have their text track cue active flag set.
    for (const track of tracks) {
        if (!track.cues) continue;
        for (const cue of track.cues) {
            if (getCueContext(cue)?.active && cue instanceof VTTCue) 
                cues.push(cue);
        }
    }
    // 9. Let regions be an empty list of WebVTT regions.
    let regions: VTTRegion[] = [];
    // 10. For each track track in tracks, append to regions all the regions with an identifier from track’s list of regions.
    for (const track of tracks) {
        regions = [...regions, ...track._regions];
    }
    const regionBoxes = new Map<VTTRegion, HTMLElement>();
    // 11. If reset is false, then, for each WebVTT region region in regions let regionNode be a WebVTT region object.
    if (!reset) {
        // 12. Apply the following steps for each regionNode:
        for (const regionNode of regions) {
            // 1. Prepare some variables for the application of CSS properties to regionNode as follows:
            // - Let regionWidth be the WebVTT region width. Let width be regionWidth vw (vw is a CSS unit). [CSS-VALUES]
            const regionWidth = regionNode.width;
            const width = (regionWidth / 100) * viewWidth;
            // - Let lineHeight be 6vh (vh is a CSS unit) [CSS-VALUES] and regionHeight be the WebVTT region lines. Let lines be lineHeight multiplied by regionHeight.
            const lineHeight = 0.06 * viewHeight;
            const regionHeight = regionNode.lines;
            const lines = lineHeight * regionHeight;
            // - Let viewportAnchorX be the x dimension of the WebVTT region anchor and regionAnchorX be the x dimension of the WebVTT region anchor. Let leftOffset be regionAnchorX multiplied by width divided by 100.0. Let left be leftOffset subtracted from viewportAnchorX vw.
            let leftOffset = regionNode.regionAnchorX * regionNode.width / 100;
            // TODO: this might be incorrectly computed
            let left = (regionNode.viewportAnchorX / 100 - leftOffset) * viewWidth;
            // - Let viewportAnchorY be the y dimension of the WebVTT region anchor and regionAnchorY be the y dimension of the WebVTT region anchor. Let topOffset be regionAnchorY multiplied by lines divided by 100.0. Let top be topOffset subtracted from viewportAnchorY vh.
            let topOffset = regionNode.regionAnchorY * regionNode.lines / 100;
            let top = (regionNode.viewportAnchorY / 100 - topOffset) * viewHeight;
            // 2. Apply the terms of the CSS specifications to regionNode within the following constraints, thus obtaining a CSS box box positioned relative to an initial containing block:
            const box = document.createElement('vtt-region');
            box.style.width = `${width}px`;
            box.style.maxHeight = `${lines}px`;
            box.style.left = `${left}px`;
            box.style.top = `${top}px`;
            // TODO: I have no idea what they want me to do here
            // 3. Add the CSS box box to output.
            textTrackContainer.append(box);
            regionBoxes.set(regionNode, box);
        }
    }
    // 13. If reset is false, then, for each WebVTT cue cue in cues: if cue’s text track cue display state has a set of CSS boxes, then:
    if (!reset) {
        for (const cue of cues) {
            const displayState = getCueContext(cue)?.displayState;
            if (!Array.isArray(displayState)) continue;
            // - If cue’s WebVTT cue region is not null, add those boxes to that region’s box and remove cue from cues.
            if (cue.region) {
                const regionBox = regionBoxes.get(cue.region);
                if (!regionBox) continue;
                regionBox.append(...displayState);
                const items = regionBox.querySelectorAll('*');
                items.forEach(item => {
                    // TODO: left, height. Is this needed?
                    item.setAttribute('style', 'position: relative; unicode-bidi: plaintext; width: auto');
                    // XXX: afaik we don't set text-align here.
                })
            } 
            // - Otherwise, add those boxes to output and remove cue from cues.
            else {
                textTrackContainer.append(...displayState);
            }
        }
        // XXX: remove cues that have non empty display states
        cues = cues.filter(cue => {
            const displayState = getCueContext(cue)?.displayState;
            return !Array.isArray(displayState) || displayState.length === 0;
        });
    }

    // XXX: this implementation is not perfectly spec compliant
    // sort by start time, earliest first
    // then sort by end time, latest first
    const trackOrderedCues = cues.sort((a, b) => {
        if (a.startTime === b.startTime)
            return b.endTime - a.endTime;
        return a.startTime - b.startTime;
    });

    // 14. For each WebVTT cue cue in cues that has not yet had corresponding CSS boxes added to output, in text track cue order, run the following substeps:
    for (const cue of trackOrderedCues) {
        // 1. Let nodes be the list of WebVTT Node Objects obtained by applying the WebVTT cue text parsing rules, with the fallback language language if provided, to the cue’s cue text.
        const nodes = WebVTTParseCueText(cue.text, cue.track?.language);
        // 2. If cue’s WebVTT cue region is null, run the following substeps:
        if (!cue.region) {
            // - Apply WebVTT cue settings to obtain CSS boxes boxes from nodes.
            const boxes = applyCueSettings(cue, nodes, videoRegion, textTrackContainer);
            // - Let cue’s text track cue display state have the CSS boxes in boxes.
            setCueDisplayState(cue, boxes);
            // - Add the CSS boxes in boxes to output.
            textTrackContainer.append(boxes);
        }
        // 3. Otherwise, run the following substeps:
        else {
            // 1. Let region be cue’s WebVTT cue region.
            const region = cue.region;
            // 2. If region’s WebVTT region scroll setting is up and region already has one child, set region’s transition-property to top and transition-duration to 0.433s.
            if (region.scroll === "up" && regionBoxes.get(region)?.children.length === 1) {
                const regionBox = regionBoxes.get(region);
                if (regionBox) {
                    regionBox.style.transitionProperty = "top";
                    regionBox.style.transitionDuration = "0.433s";
                }
            }
            // 3. Let offset be cue’s computed position multiplied by region’s WebVTT region width and divided by 100 (i.e. interpret it as a percentage of the region width).
            const computedPositon = getComputedPosition(cue);
            let offset = computedPositon * region.width / 100;
            // 4. Adjust offset using cue’s computed position alignment as follows:
            // - If the computed position alignment is center alignment
            if (cue.positionAlign === "center") {
                // Subtract half of region’s WebVTT region width from offset.
                offset -= region.width / 2;
            }
            // - If the computed position alignment is line-right alignment
            else if (cue.positionAlign === "line-right") {
                // Subtract region’s WebVTT region width from offset.
                offset -= region.width;
            }
            // 5. Let left be offset %. [CSS-VALUES]
            let left = `${offset}%`;
            // 6. Obtain a set of CSS boxes boxes positioned relative to an initial containing block.
            const boxes = obtainCSSBoxes(cue, nodes);
            boxes.style.left = left;
            // 7. If there are no line boxes in boxes, skip the remainder of these substeps for cue. The cue is ignored.
            // TODO: check this condition
            // 8. Let cue’s text track cue display state have the CSS boxes in boxes.
            setCueDisplayState(cue, boxes);
            // 9. Add the CSS boxes in boxes to region.
            const regionBox = regionBoxes.get(region);
            if (regionBox) {
                regionBox.append(boxes);
            }
            // 10. If the CSS boxes boxes together have a height less than the height of the region box, let diff be the absolute difference between the two height values. Increase top by diff and re-apply it to regionNode.
            const boxesHeight = boxes.getBoundingClientRect().height;
            const regionBoxHeight = regionBox?.getBoundingClientRect().height ?? 0;
            const diff = Math.abs(boxesHeight - regionBoxHeight);
            if (boxesHeight < regionBoxHeight && regionBox) {
                regionBox.style.top = `${parseFloat(regionBox.style.top.substring(0, regionBox.style.top.length - 2)) + diff}px`;
            }
        }
    }
    // 15. Return output.
    // XXX: we've already appended to textTrackContainer and added it to the DOM
}

function applyCueSettings(cue: VTTCue, nodes: WebVTTNodeList, viewRect: DOMRect, container: HTMLElement) {
    const viewWidth = viewRect.width;
    const viewHeight = viewRect.height;
    // 2. Determine the value of maximum size for cue as per the appropriate rules from the following list:
    const computedPositionAlignment = getComputedPositionAlign(cue);
    const computedPosition = getComputedPosition(cue);
    const computedLine = getComputedLine(cue);
    const maximumSize = 
        computedPositionAlignment === "line-left" ?
            100 - computedPosition :
        computedPositionAlignment === "line-right" ?
            computedPosition :
        computedPositionAlignment === "center" && computedPosition <= 50 ?
            2 * computedPosition :
            (100 - computedPosition) * 2;
    // 3. If the WebVTT cue size is less than maximum size, then let size be WebVTT cue size. Otherwise, let size be maximum size.
    const size = cue.size < maximumSize ? cue.size : maximumSize;
    // 4. If the WebVTT cue writing direction is horizontal, then let width be size vw and height be auto. Otherwise, let width be auto and height be size vh. (These are CSS values used by the next section to set CSS properties for the rendering; vw and vh are CSS units.) [CSS-VALUES]
    const width = 
        cue.vertical === "" ?
            `${(size / 100) * viewWidth}px` :
            "auto";
    const height =
        cue.vertical === "" ?
            "auto" :
            `${(size / 100) * viewHeight}px`;
    // 5. Determine the value of x-position or y-position for cue as per the appropriate rules from the following list:
    // 6. Determine the value of whichever of x-position or y-position is not yet calculated for cue as per the appropriate rules from the following list:
    let xPosition = 
        cue.vertical === "" ?
            computedPositionAlignment === "line-left" ?
                computedPosition :
            computedPositionAlignment === "center" ?
                computedPosition - (size / 2) :
                computedPosition - size :
        cue.snapToLines ?
            0 :
            computedLine;

    let yPosition =
        cue.vertical !== "" ?
            computedPositionAlignment === "line-left" ?
                computedPosition :
            computedPositionAlignment === "center" ?
                computedPosition - (size / 2) :
                computedPosition - size :
        cue.snapToLines ?
            0 :
            computedLine;
    
    // 7. Let left be x-position vw and top be y-position vh. (These are CSS values used by the next section to set CSS properties for the rendering; vw and vh are CSS units.) [CSS-VALUES]
    const top = `${(yPosition / 100) * viewHeight}px`;
    const left = `${(xPosition / 100) * viewWidth}px`;

    // 8. Obtain a set of CSS boxes boxes positioned relative to an initial containing block.
    const boxes = obtainCSSBoxes(cue, nodes);
    boxes.style.top = top;
    boxes.style.left = left;
    boxes.style.width = width;
    boxes.style.height = height;

    // 9. If there are no line boxes in boxes, skip the remainder of these substeps for cue. The cue is ignored.
    // TODO: check this condition

    // 10. Adjust the positions of boxes according to the appropriate steps from the following list:
    // - If cue’s WebVTT cue snap-to-lines flag is true
    if (cue.snapToLines) {
        const horizontal = cue.vertical === "";
        // 1. Horizontal: Let full dimension be the height of video’s rendering area.
        // Vertical: Let full dimension be the width of video’s rendering area.
        const fullDimension = horizontal ? viewHeight : viewWidth;
        // 2. Horizontal: Let step be the height of the first line box in boxes.
        // Vertical: Let step be the width of the first line box in boxes.
        boxes.style.opacity = "0";
        container.append(boxes);
        const rects = boxes.querySelector('vtt-cue-bgbox')?.getClientRects();
        const boundingRect = boxes.getBoundingClientRect();
        container.removeChild(boxes);
        boxes.style.removeProperty("opacity");
        if (!rects) return boxes;
        let step = horizontal ? rects[0]?.height : rects[0]?.width;
        // 3. If step is zero, then jump to the step labeled done positioning below.
        if (!step) return boxes;
        // 4. Let line be cue's computed line.
        let line = getComputedLine(cue);
        // 5. Round line to an integer by adding 0.5 and then flooring it.
        line = Math.floor(line + 0.5);
        // 6. Vertical Growing Left: Add one to line then negate it.
        if (cue.vertical === "rl") {
            line = -(line + 1);
        }
        // 7. Let position be the result of multiplying step and line.
        let position = step * line;
        // 8. Vertical Growing Left: Decrease position by the width of the bounding box of the boxes in boxes, then increase position by step.
        if (cue.vertical === "rl") {
            // TODO: check this
            position -= boundingRect.width;
            position += step;
        }
        // 9. If line is less than zero then increase position by max dimension, and negate step.
        if (line < 0) {
            position += fullDimension;
            step = -step;
        }
        // 10. Horizontal: Move all the boxes in boxes down by the distance given by position.
        // Vertical: Move all the boxes in boxes right by the distance given by position.
        if (horizontal) {
            boxes.style.top = `${parseFloat(top.substring(0, top.length - 2)) + position}px`;
        } else {
            boxes.style.left = `${parseFloat(left.substring(0, left.length - 2)) + position}px`;
        }
        // 11. Remember the position of all the boxes in boxes as their specified position.
        const specifiedTop = boxes.style.top;
        const specifiedLeft = boxes.style.left;
        // 12. Step loop: If none of the boxes in boxes would overlap any of the boxes in output, and all of the boxes in boxes are entirely within the title area box, then jump to the step labeled done positioning below.
        let switched = false;
        while (true) {
            const { fits, aboveView, belowView, leftOfView, rightOfView, collides } = noOverlapsAndContained(boxes, container, viewRect);
            if (fits && !collides) return boxes;
            // 14. Horizontal: If step is negative and the top of the first line box in boxes is now above the top of the title area, or if step is positive and the bottom of the first line box in boxes is now below the bottom of the title area, jump to the step labeled switch direction.
            // Vertical: If step is negative and the left edge of the first line box in boxes is now to the left of the left edge of the title area, or if step is positive and the right edge of the first line box in boxes is now to the right of the right edge of the title area, jump to the step labeled switch direction.
            if (step < 0) {
                const shouldSwitchDirection = 
                    (horizontal && (step < 0 && aboveView || step > 0 && belowView)) || 
                    (!horizontal && (step < 0 && leftOfView || step > 0 && rightOfView));
                if (shouldSwitchDirection) {
                    // 17. Switch direction: If switched is true, then remove all the boxes in boxes, and jump to the step labeled done positioning below.
                    if (switched) {
                        return document.createElement('vtt-cue-root');
                    }
                    // 18. Otherwise, move all the boxes in boxes back to their specified position as determined in the earlier step.
                    boxes.style.top = specifiedTop;
                    boxes.style.left = specifiedLeft;
                    // 19. Negate step.
                    step = -step;
                    // 20. Set switched to true.
                    switched = true;
                    // 21. Jump to the step labeled step loop.
                    continue;
                }
            }
            // 15. Horizontal: Move all the boxes in boxes down by the distance given by step. (If step is negative, then this will actually result in an upwards movement of the boxes in absolute terms.)
            // Vertical: Move all the boxes in boxes right by the distance given by step. (If step is negative, then this will actually result in a leftwards movement of the boxes in absolute terms.)
            if (horizontal) {
                boxes.style.top = `${parseFloat(boxes.style.top.substring(0, boxes.style.top.length - 2)) + step}px`;
            } else {
                boxes.style.left = `${parseFloat(boxes.style.left.substring(0, boxes.style.left.length - 2)) + step}px`;
            }
        }
    } 
    // - If cue’s WebVTT cue snap-to-lines flag is false
    else {
        // 1. Let bounding box be the bounding box of the boxes in boxes.
        container.append(boxes);
        const boundingBox = boxes.getBoundingClientRect();
        container.removeChild(boxes);
        // 2. Run the appropriate steps from the following list:
        // - If the WebVTT cue writing direction is horizontal
        if (cue.vertical == "") {
            // - If the WebVTT cue line alignment is center alignment
            // Move all the boxes in boxes up by half of the height of bounding box.
            boxes.style.top = `${parseFloat(top.substring(0, top.length - 2)) - (boundingBox.height/2)}px`;
            // - If the WebVTT cue line alignment is end alignment
            // Move all the boxes in boxes up by the height of bounding box.
            boxes.style.top = `${parseFloat(top.substring(0, top.length - 2)) - boundingBox.height}px`;
        // - If the WebVTT cue writing direction is vertical growing left or vertical growing right
        } else {
            // - If the WebVTT cue line alignment is center alignment
            // Move all the boxes in boxes left by half of the width of bounding box.
            boxes.style.left = `${parseFloat(left.substring(0, left.length - 2)) - (boundingBox.width/2)}px`;
            // - If the WebVTT cue line alignment is end alignment
            // Move all the boxes in boxes left by the width of bounding box.
            boxes.style.left = `${parseFloat(left.substring(0, left.length - 2)) - boundingBox.width}px`;
        }
        // 3. If none of the boxes in boxes would overlap any of the boxes in output, and all the boxes in boxes are within the video’s rendering area, then jump to the step labeled done positioning below.
        const { fits, aboveView, belowView, leftOfView, rightOfView, collides } = noOverlapsAndContained(boxes, container, viewRect);
        // 4. If there is a position to which the boxes in boxes can be moved while maintaining the relative positions of the boxes in boxes to each other such that none of the boxes in boxes would overlap any of the boxes in output, and all the boxes in boxes would be within the video’s rendering area, then move the boxes in boxes to the closest such position to their current position, and then jump to the step labeled done positioning below. If there are multiple such positions that are equidistant from their current position, use the highest one amongst them; if there are several at that height, then use the leftmost one amongst them.
        if (fits && !collides) return boxes;
        // We first move the box into view
        if (aboveView) 
            boxes.style.top = '0px';
        else if (belowView)
            boxes.style.top = `${viewRect.height - boundingBox.height}px`;
        if (leftOfView)
            boxes.style.left = '0px';
        else if (rightOfView)
            boxes.style.left = `${viewRect.width - boundingBox.width}px`;
        // TODO: We must now find a position that doesn't overlap any other boxes

        // 5. Otherwise, jump to the step labeled done positioning below. (The boxes will unfortunately overlap.)
        return boxes;
    }
}

// If none of the boxes in boxes would overlap any of the boxes in output, and all of the boxes in boxes are entirely within the title area box, then jump to the step labeled done positioning below.
function noOverlapsAndContained(boxes: HTMLElement, outputContainer: HTMLElement, viewRect: DOMRect) {
    boxes.style.opacity = "0";
    outputContainer.append(boxes);
    const boundingRect = boxes.getBoundingClientRect();
    outputContainer.removeChild(boxes);
    boxes.style.removeProperty("opacity");
    const belowView = boundingRect.bottom > viewRect.bottom;
    const aboveView = boundingRect.top < viewRect.top;
    const leftOfView = boundingRect.left < viewRect.left;
    const rightOfView = boundingRect.right > viewRect.right;
    const fits = !belowView && !aboveView && !leftOfView && !rightOfView;

    const children = outputContainer.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!["DIV", "VTT-CUE-ROOT"].includes(child?.nodeName)) continue;
        const childRect = child.getBoundingClientRect();
        // AABB collision detection
        const collides =
            boundingRect.left < childRect.right &&
            boundingRect.right > childRect.left &&
            boundingRect.top < childRect.bottom &&
            boundingRect.bottom > childRect.top;
        if (collides)
            return {
                fits,
                belowView, 
                aboveView,
                leftOfView,
                rightOfView,
                collides
            };
    };

    return {
        fits,
        belowView, 
        aboveView,
        leftOfView,
        rightOfView,
        collides: false
    };
}

function applyClassList(element: Element, node: WebVTTInternalNode) {
    if (node.classNames.length > 0) element.setAttribute('class', node.classNames.join(' '));
}

function constructDOMFromNodes(element: WebVTTNode): Node {
    // TODO: again, this might be optimized, its a massive if-else ladder
    if (element instanceof WebVTTNodeList) {
        const root = document.createDocumentFragment();
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    // XXX: not included is WebVTT Region Object, since it is seems illogical to include it here
    else if (element instanceof WebVTTClass) {
        const root = document.createElement('span');
        applyClassList(root, element);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTItalic) {
        const root = document.createElement('i');
        applyClassList(root, element);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTBold) {
        const root = document.createElement('b');
        applyClassList(root, element);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTUnderline) {
        const root = document.createElement('u');
        applyClassList(root, element);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTRuby) {
        const root = document.createElement('ruby');
        applyClassList(root, element);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTRubyText) {
        const root = document.createElement('rt');
        applyClassList(root, element);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTVoice) {
        const root = document.createElement('v');
        root.setAttribute('title', element.value);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTLanguage) {
        const root = document.createElement('span');
        root.setAttribute('lang', element.lang);
        for (const child of element.children) {
            root.appendChild(constructDOMFromNodes(child));
        }
        return root;
    }
    else if (element instanceof WebVTTText) {
        const root = document.createElement('span');
        root.appendChild(document.createTextNode(element.value));
        return root;
    }
    else if (element instanceof WebVTTTimestamp) {
        return document.createProcessingInstruction('timestamp', toTimestampString(element.value));
    }
    // XXX: this should be unreachable
    throw new Error('Unreachable state reached');
}

function obtainCSSBoxes(cue: VTTCue, nodes: WebVTTNodeList) {
    // The children of the nodes must be wrapped in an anonymous box whose display property has the value inline. This is the WebVTT cue background box.
    const rootBox = document.createElement('vtt-cue-root');
    rootBox.setAttribute('vertical', cue.vertical);
    rootBox.setAttribute('align', cue.align);
    
    // The background shorthand property on the WebVTT cue background box and on WebVTT Ruby Text Objects must be set to rgba(0,0,0,0.8). [CSS3-COLOR]
    const cueBackgroundBox = document.createElement('vtt-cue-bgbox');

    cueBackgroundBox.append(constructDOMFromNodes(nodes) as DocumentFragment);
    rootBox.append(cueBackgroundBox);

    return rootBox;
}

function getComputedLine(cue: VTTCue) {
    // 1. If the line is numeric, the WebVTT cue snap-to-lines flag of the WebVTT cue is false, and the line is negative or greater than 100, then return 100 and abort these steps.
    if (typeof cue.line === 'number' && !cue.snapToLines && (cue.line < 0 || cue.line > 100)) {
        return 100;
    }
    // 2. If the line is numeric, return the value of the WebVTT cue line and abort these steps. (Either the WebVTT cue snap-to-lines flag is true, so any value, not just those in the range 0..100, is valid, or the value is in the range 0..100 and is thus valid regardless of the value of that flag.)
    if (typeof cue.line === 'number') {
        return cue.line;
    }
    // 3. If the WebVTT cue snap-to-lines flag of the WebVTT cue is false, return the value 100 and abort these steps. (The line is the special value auto.)
    if (!cue.snapToLines) {
        return 100;
    }

    // 4. Let cue be the WebVTT cue.
    // 5. If cue is not in a list of cues of a text track, or if that text track is not in the list of text tracks of a media element, return −1 and abort these steps.
    if (!cue.track) return -1;

    // TODO: implement this ordering
    return -1;
    // 6. Let track be the text track whose list of cues the cue is in.
    // 7. Let n be the number of text tracks whose text track mode is showing and that are in the media element’s list of text tracks before track.
    // 8. Increment n by one.
    // 9. Negate n.
    // 10. Return n.
}

function getComputedPosition(cue: VTTCue) {
    // 1. If the position is numeric between 0 and 100, then return the value of the position and abort these steps. (Otherwise, the position is the special value auto.)
    if (typeof cue.position === 'number' && cue.position >= 0 && cue.position <= 100) {
        return cue.position;
    }
    // 2. If the WebVTT cue text alignment is left, return line-left and abort these steps.
    if (cue.align === 'left') {
        return 0;
    }
    // 3. If the cue text alignment is right, return 100 and abort these steps.
    if (cue.align === 'right') {
        return 100;
    }
    // 4. Otherwise, return 50 and abort these steps.
    return 50;
}

function getComputedPositionAlign(cue: VTTCue): "line-left" | "line-right" | "center" {
    // 1. If the WebVTT cue position alignment is not auto, then return the value of the WebVTT cue position alignment and abort these steps.
    if (cue.positionAlign !== 'auto') {
        return cue.positionAlign;
    }
    // 2. If the WebVTT cue text alignment is left, return line-left and abort these steps.
    if (cue.align === 'left') {
        return 'line-left';
    }
    // 3. If the WebVTT cue text alignment is right, return line-right and abort these steps.
    if (cue.align === 'right') {
        return 'line-right';
    }
    // 4. If the WebVTT cue text alignment is start, return line-left if the base direction of the cue text is left-to-right, line-right otherwise.
    if (cue.align === 'start') {
        // TODO: base direction computation
        return 'line-left';
    }
    // 5. If the WebVTT cue text alignment is end, return line-right if the base direction of the cue text is left-to-right, line-left otherwise.
    if (cue.align === 'end') {
        // TODO: base direction computation
        return 'line-right';
    }
    // 6. Otherwise, return center.
    return 'center';
}
