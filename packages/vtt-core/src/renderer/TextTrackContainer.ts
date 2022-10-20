const template = document.createElement("template");

template.innerHTML = `
<style>
vtt-region {
    position: absolute;
    writing-mode: horizontal-tb;
    background: rgba(0,0,0,0.8);
    overflow-wrap: break-word;
    font: calc(var(--vtt-view-height) * 0.05) sans-serif;
    color: rgba(255,255,255,1);
    overflow: hidden;
    min-height: 0px;
    display: inline-flex;
    flex-flow: column;
    justify-content: flex-end;
}
vtt-region * {
    position: relative;
    unicode-bidi: plaintext;
    width: auto;
}
vtt-cue-bgbox {
    background: var(--vtt-cue-bgbox-color, rgba(0,0,0,0.8));
    display: inline;
}
i {
    font-style: italic;
}
b {
    font-weight: bold;
}
u {
    text-decoration: underline;
}
ruby {
    display: ruby;
}
ruby * {
    display: ruby-base;
}
rt {
    display: ruby-text;
}
v {
    display: inline;
}
vtt-cue-root {
    position: absolute;
    unicode-bidi: plaintext;
    overflow-wrap: break-word;
    color: rgba(255,255,255,1);
    white-space: pre-line;
    text-wrap: balance;
    font: calc(var(--vtt-view-height) * 0.05) sans-serif;
}
.white {
    color: rgba(255,255,255,1);
}
.lime {
    color: rgba(0,255,0,1);
}
.cyan {
    color: rgba(0,255,255,1);
}
.red {
    color: rgba(255,0,0,1);
}
.yellow {
    color: rgba(255,255,0,1);
}
.magenta {
    color: rgba(255,0,255,1);
}
.blue {
    color: rgba(0,0,255,1);
}
.black {
    color: rgba(0,0,0,1);
}
vtt-cue-root.bg_white {
    --vtt-cue-bgbox-color: rgba(255,255,255,1);
}
vtt-cue-root.bg_lime {
    --vtt-cue-bgbox-color: rgba(0,255,0,1);
}
vtt-cue-root.bg_cyan {
    --vtt-cue-bgbox-color: rgba(0,255,255,1);
}
vtt-cue-root.bg_red {
    --vtt-cue-bgbox-color: rgba(255,0,0,1);
}
vtt-cue-root.bg_yellow {
    --vtt-cue-bgbox-color: rgba(255,255,0,1);
}
vtt-cue-root.bg_magenta {
    --vtt-cue-bgbox-color: rgba(255,0,255,1);
}
vtt-cue-root.bg_blue {
    --vtt-cue-bgbox-color: rgba(0,0,255,1);
}
vtt-cue-root.bg_black {
    --vtt-cue-bgbox-color: rgba(0,0,0,1);
}
.bg_white:not(vtt-cue-root) {
    background: rgba(255,255,255,1);
}
.bg_lime:not(vtt-cue-root) {
    background: rgba(0,255,0,1);
}
.bg_cyan:not(vtt-cue-root) {
    background: rgba(0,255,255,1);
}
.bg_red:not(vtt-cue-root) {
    background: rgba(255,0,0,1);
}
.bg_yellow:not(vtt-cue-root) {
    background: rgba(255,255,0,1);
}
.bg_magenta:not(vtt-cue-root) {
    background: rgba(255,0,255,1);
}
.bg_blue:not(vtt-cue-root) {
    background: rgba(0,0,255,1);
}
.bg_black:not(vtt-cue-root) {
    background: rgba(0,0,0,1);
}
</style>
<slot></slot>
`;

class TextTrackContainer extends HTMLElement {
    #hostStyles: HTMLStyleElement;
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.#hostStyles = document.createElement('style');
        this.shadowRoot!.appendChild(this.#hostStyles);
        this.shadowRoot!.appendChild(template.content.cloneNode(true));

        this.applyStyles();
    }

    applyStyles() {
        const viewHeight = parseFloat(this.getAttribute('vheight')||"0");
        this.#hostStyles.textContent = `:host {
    --vtt-view-height: ${viewHeight}px;
}`;
    }

    attributeChangedCallback() {
        this.applyStyles();
    }

    static get observedAttributes() {
        return ['vheight']
    }

    appendChild<T extends Node>(node: T): T {
        return this.shadowRoot!.querySelector('slot')!.appendChild(node);
    }

    append(...nodes: (string | Node)[]): void {
        this.shadowRoot!.querySelector('slot')!.append(...nodes);
    }

    removeChild<T extends Node>(child: T): T {
        return this.shadowRoot!.querySelector('slot')!.removeChild(child);
    }

    get innerHTML(): string {
        return this.shadowRoot!.querySelector('slot')!.innerHTML;
    }

    set innerHTML(value: string) {
        this.shadowRoot!.querySelector('slot')!.innerHTML = value;
    }

    get children() {
        return this.shadowRoot!.querySelector('slot')!.children;
    }
}

window.customElements.define('vtt-texttrackcontainer', TextTrackContainer);
