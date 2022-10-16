import named_character_reference from "./NamedCharacterReference";
import VTTParser from "./VTTParser";

export class WebVTTNode {}

export class WebVTTInternalNode extends WebVTTNode {
    #children: WebVTTNode[] = [];
    #classNames: string[] = [];
    #lang: string = ""; // TODO: sane default
    #parent: WebVTTInternalNode | null = null;

    get parent() {
        return this.#parent;
    }

    constructor(classNames: string[], lang?: string) {
        super();
        // 2. Set the new object’s list of applicable classes to the list of classes in the token, excluding any classes that are the empty string.
        this.#classNames = [...new Set(classNames)];
        // 3. Set the new object’s applicable language to the top entry on the language stack, if the stack is not empty.
        this.#lang = lang ?? "";
    }

    attachTo(node: WebVTTInternalNode) {
        node.addNode(this);
        this.#parent = node;
    }

    [Symbol.iterator]() {
        return this.#children[Symbol.iterator]();
    }

    get children() {
        return [...this.#children];
    }

    get classNames() {
        return [...this.#classNames];
    }

    get lang() {
        return this.#lang;
    }

    set lang(lang: string) {
        this.#lang = lang;
    }

    addNode(node: WebVTTNode) {
        this.#children.push(node);
    }
}

export class WebVTTNodeList extends WebVTTInternalNode {
    constructor() {
        super([]);
    }
} 

export class WebVTTClass extends WebVTTInternalNode {}

export class WebVTTItalic extends WebVTTInternalNode {}

export class WebVTTBold extends WebVTTInternalNode {}

export class WebVTTUnderline extends WebVTTInternalNode {}

export class WebVTTRuby extends WebVTTInternalNode {}

export class WebVTTRubyText extends WebVTTInternalNode {}

export class WebVTTVoice extends WebVTTInternalNode {
    #value: string;
    constructor(classList: string[], lang: string | undefined, value: string) {
        super(classList, lang);
        this.#value = value;
    }
    get value() {
        return this.#value;
    }
}

export class WebVTTLanguage extends WebVTTInternalNode {}

export class WebVTTLeafNode extends WebVTTNode {}

export class WebVTTText extends WebVTTLeafNode {
    #value: string = "";

    get value() {
        return this.#value;
    }

    constructor(value: string) {
        super();
        this.#value = value;
    }
}

export class WebVTTTimestamp extends WebVTTLeafNode {
    #value: number = 0;

    constructor(value: number) {
        super();
        this.#value = value;
    }

    get value() {
        return this.#value;
    }
}

export default function WebVTTParseCueText(input: string, language?: string) {
    // 2. Let position be a pointer into input, initially pointing at the start of the string.
    let position = 0;
    // 3. Let result be a list of WebVTT Node Objects, initially empty.
    const result = new WebVTTNodeList();
    // 4. Let current be the WebVTT Internal Node Object result.
    let current: WebVTTInternalNode = result;
    // 5. Let language stack be a stack of language tags, initially empty.
    const languageStack: string[] = [];
    // 6. If language is set, set result’s applicable language to language, and push language onto the language stack.
    if (language) {
        result.lang = language;
        languageStack.push(language);
    }
    // 7. Loop: If position is past the end of input, return result and abort these steps.
    while (position < input.length) {
        // 8. Let token be the result of invoking the WebVTT cue text tokenizer.
        const {token, position: newPosition} = WebVTTCueTextTokenizer(input, position);
        position = newPosition;
        // 9. Run the appropriate steps given the type of token:
        switch (token.type) {
            case 'string':
            {
                // 1. Create a WebVTT Text Object whose value is the value of the string token token.
                const text = new WebVTTText(token.value);
                // 2. Append the newly created WebVTT Text Object to current.
                current.addNode(text);
            }
            break; // end if token is a string
            case 'start_tag':
            {
                // How the start tag token token is processed depends on its tag name, as follows:
                switch (token.tagName) {
                    case 'c':
                    {
                        // Attach a WebVTT Class Object.
                        const node = new WebVTTClass(token.classList, languageStack[languageStack.length - 1]);
                        // 4. Append the newly created node object to current.
                        node.attachTo(current);
                        // 5. Let current be the newly created node object.
                        current = node;
                    }
                    break;
                    case 'i':
                    {
                        // Attach a WebVTT Italic Object.
                        const node = new WebVTTItalic(token.classList, languageStack[languageStack.length - 1]);
                        // 4. Append the newly created node object to current.
                        node.attachTo(current);
                        // 5. Let current be the newly created node object.
                        current = node;
                    }
                    break;
                    case 'b':
                    {
                        // Attach a WebVTT Bold Object.
                        const node = new WebVTTBold(token.classList, languageStack[languageStack.length - 1]);
                        // 4. Append the newly created node object to current.
                        node.attachTo(current);
                        // 5. Let current be the newly created node object.
                        current = node;
                    }
                    break;
                    case 'u':
                    {
                        // Attach a WebVTT Underline Object.
                        const node = new WebVTTUnderline(token.classList, languageStack[languageStack.length - 1]);
                        // 4. Append the newly created node object to current.
                        node.attachTo(current);
                        // 5. Let current be the newly created node object.
                        current = node;
                    }
                    break;
                    case 'ruby':
                    {
                        // Attach a WebVTT Ruby Object.
                        const node = new WebVTTRuby(token.classList, languageStack[languageStack.length - 1]);
                        // 4. Append the newly created node object to current.
                        node.attachTo(current);
                        // 5. Let current be the newly created node object.
                        current = node;
                    }
                    break;
                    case 'rt':
                    {
                        // If current is a WebVTT Ruby Object, then attach a WebVTT Ruby Text Object.
                        if (current instanceof WebVTTRuby) {
                            const node = new WebVTTRubyText(token.classList, languageStack[languageStack.length - 1]);
                            // 4. Append the newly created node object to current.
                            node.attachTo(current);
                            // 5. Let current be the newly created node object.
                            current = node;
                        }
                    }
                    break;
                    case 'v':
                    {
                        // Attach a WebVTT Voice Object, and set its value to the token’s annotation string, or the empty string if there is no annotation string.
                        const node = new WebVTTVoice(token.classList, languageStack[languageStack.length - 1], token.annotation ?? "");
                    }
                    break;
                    case 'lang':
                    {
                        // Push the value of the token’s annotation string, or the empty string if there is no annotation string, onto the language stack; then attach a WebVTT Language Object.
                        languageStack.push(token.annotation ?? "");
                        const node = new WebVTTLanguage(token.classList, languageStack[languageStack.length - 1]);
                        // 4. Append the newly created node object to current.
                        node.attachTo(current);
                        // 5. Let current be the newly created node object.
                        current = node;
                    }
                    break;
                    default:
                    {
                        // Ignore the token.
                    }
                    break;
                }
            }
            break; // end if token is a start tag
            case 'end_tag':
            {
                // If any of the following conditions is true, then let current be the parent node of current.
                // TODO: this might be optimized (its a massive if-else ladder)
                // - The tag name of the end tag token token is "c" and current is a WebVTT Class Object.
                if (token.tagName === 'c' && current instanceof WebVTTClass) {
                    current = current.parent || result; // XXX: this is non standard, but it's the only way to make it work, if there is no parent, set it to the root (result)
                }
                // - The tag name of the end tag token token is "i" and current is a WebVTT Italic Object.
                else if (token.tagName === 'i' && current instanceof WebVTTItalic) {
                    current = current.parent || result;
                }
                // - The tag name of the end tag token token is "b" and current is a WebVTT Bold Object.
                else if (token.tagName === 'b' && current instanceof WebVTTBold) {
                    current = current.parent || result;
                }
                // - The tag name of the end tag token token is "u" and current is a WebVTT Underline Object.
                else if (token.tagName === 'u' && current instanceof WebVTTUnderline) {
                    current = current.parent || result;
                }
                // - The tag name of the end tag token token is "ruby" and current is a WebVTT Ruby Object.
                else if (token.tagName === 'ruby' && current instanceof WebVTTRuby) {
                    current = current.parent || result;
                }
                // - The tag name of the end tag token token is "rt" and current is a WebVTT Ruby Text Object.
                else if (token.tagName === 'rt' && current instanceof WebVTTRubyText) {
                    current = current.parent || result;
                }
                // - The tag name of the end tag token token is "v" and current is a WebVTT Voice Object.
                else if (token.tagName === 'v' && current instanceof WebVTTVoice) {
                    current = current.parent || result;
                }
                // Otherwise, if the tag name of the end tag token token is "lang" and current is a WebVTT Language Object, then let current be the parent node of current, and pop the top value from the language stack.
                else if (token.tagName === 'lang' && current instanceof WebVTTLanguage) {
                    current = current.parent || result;
                    languageStack.pop();
                }
                // Otherwise, if the tag name of the end tag token token is "ruby" and current is a WebVTT Ruby Text Object, then let current be the parent node of the parent node of current.
                else if (token.tagName === 'ruby' && current instanceof WebVTTRubyText) {
                    current = current.parent?.parent || result;
                }
                // Otherwise, ignore the token.
                // XXX: do nothing, the next token will be processed
            }
            break; // end if token is an end tag
            case 'timestamp':
            {
                // 1. Let input be the tag value.
                const input = token.value;
                // 2. Let position be a pointer into input, initially pointing at the start of the string.
                let position = 0;
                // 3. Collect a WebVTT timestamp.
                const { position: newPosition, success, time } = VTTParser.collectTimestamp(input, position);
                // 4. If that algorithm does not fail, and if position now points at the end of input (i.e. there are no trailing characters after the timestamp), then create a WebVTT Timestamp Object whose value is the collected time, then append it to current.
                if (success && newPosition === input.length) {
                    const node = new WebVTTTimestamp(time);
                    current.addNode(node);
                }
                // Otherwise, ignore the token.
                // XXX: do nothing, the next token will be processed
            }
            break;
        }
    }
    return result;
}

interface WebVTTTokenString {
    type: "string";
    value: string;
}

interface WebVTTTokenStartTag {
    type: "start_tag";
    tagName: string;
    classList: string[];
    annotation?: string;
}

interface WebVTTTokenEndTag {
    type: "end_tag";
    tagName: string;
}

interface WebVTTTokenTimestamp {
    type: "timestamp";
    value: string;
}

type WebVTTTokenizerState = "webvtt_data" | "webvtt_tag" | "webvtt_start_tag_annotation" | "webvtt_start_tag_class" | "webvtt_end_tag" | "webvtt_start_tag" | "webvtt_timestamp_tag" | "html_character_reference_in_data" | "html_character_reference_in_annotation"

function WebVTTCueTextTokenizer(input: string, position: number): { position: number, token: WebVTTTokenString | WebVTTTokenStartTag | WebVTTTokenEndTag | WebVTTTokenTimestamp } {
    // 2. Let tokenizer state be WebVTT data state.
    let tokenizerState: WebVTTTokenizerState = "webvtt_data";
    // 3. Let result be the empty string.
    let result = "";
    let buffer = "";
    // 4. Let classes be an empty list.
    const classes: string[] = [];
    // 5. Loop: If position is past the end of input, let c be an end-of-file marker. Otherwise, let c be the character in input pointed to by position.
    let c: string | null = null;
    while (true) {
        c = position < input.length ? input.charAt(position) : null;
        // 6. Jump to the state given by tokenizer state:
        switch (tokenizerState) {
            case 'webvtt_data':
            {
                switch (c) {
                    case '&':
                        {
                            // Set tokenizer state to the HTML character reference in data state, and jump to the step labeled next.
                            tokenizerState = "html_character_reference_in_data";
                            position++;
                            continue;
                        }
                        break;
                    case '<':
                        {
                            // If result is the empty string, then set tokenizer state to the WebVTT tag state and jump to the step labeled next.
                            if (result === "") {
                                tokenizerState = "webvtt_tag";
                                position++;
                                continue;
                            }
                            // Otherwise, return a string token whose value is result and abort these steps.
                            return {
                                position,
                                token: {
                                    type: "string",
                                    value: result
                                }
                            }
                        }
                        break;
                    case null:
                        {
                            // Return a string token whose value is result and abort these steps.
                            return {
                                position,
                                token: {
                                    type: "string",
                                    value: result
                                }
                            }
                        }
                        break;
                    default:
                        {
                            // Append c to result and jump to the step labeled next.
                            result += c;
                            position++;
                            continue;
                        }
                        break;
                }
            }
            break; // end webvtt_data
            case 'html_character_reference_in_data':
            {
                // Attempt to consume an HTML character reference, with no additional allowed character.
                const {reference, position: newPosition} = consumeCharacterReference(input, position);
                position = newPosition;
                // If nothing is returned, append "&" to result.
                if (reference === null) {
                    result += "&";
                }
                // Otherwise, append the data of the character tokens that were returned to result.
                else {
                    result += reference;
                }
                // Then, in any case, set tokenizer state to the WebVTT data state, and jump to the step labeled next.
                tokenizerState = "webvtt_data";
                // TODO: this is possibly wrong
                // might need a position++ here
                continue;
            }
            break; // end html_character_reference_in_data
            case 'webvtt_tag':
            {
                // Jump to the entry that matches the value of c:
                switch (c) {
                    case '\u0009':
                    case '\u000A':
                    case '\u000C':
                    case '\u0020':
                    {
                        // Set tokenizer state to the WebVTT start tag annotation state, and jump to the step labeled next.
                        tokenizerState = "webvtt_start_tag_annotation";
                        position++;
                        continue;
                    }
                    break;
                    case '\u002E':
                    {
                        // Set tokenizer state to the WebVTT start tag class state, and jump to the step labeled next.
                        tokenizerState = "webvtt_start_tag_class";
                        position++;
                        continue;
                    }
                    break;
                    case '\u002F': 
                    {
                        // Set tokenizer state to the WebVTT end tag state, and jump to the step labeled next.
                        tokenizerState = "webvtt_end_tag";
                        position++;
                        continue;
                    }
                    break;
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                    {
                        // Set result to c, set tokenizer state to the WebVTT timestamp tag state, and jump to the step labeled next.
                        result = c;
                        tokenizerState = "webvtt_timestamp_tag";
                        position++;
                        continue;
                    }
                    break;
                    case '\u003E':
                    {
                        // Advance position to the next character in input, then jump to the next "end-of-file marker" entry below.
                        position++;
                    }
                    case null:
                    {
                        // Return a start tag whose tag name is the empty string, with no classes and no annotation, and abort these steps.
                        return {
                            position,
                            token: {
                                type: "start_tag",
                                tagName: "",
                                classList: []
                            }
                        };
                    }
                    break;
                    default:
                    {
                        // Set result to c, set tokenizer state to the WebVTT start tag state, and jump to the step labeled next.
                        result = c;
                        tokenizerState = "webvtt_start_tag";
                        position++;
                        continue;
                    }
                    break;
                }
            }
            break; // end webvtt_tag
            case 'webvtt_start_tag':
            {
                // Jump to the entry that matches the value of c:
                switch (c) {
                    case '\u0009':
                    case '\u000C':
                    case '\u0020':
                    {
                        // Set tokenizer state to the WebVTT start tag annotation state, and jump to the step labeled next.
                        tokenizerState = "webvtt_start_tag_annotation";
                        position++;
                        continue;
                    }
                    break;
                    case '\u000A':
                    {
                        // Set buffer to c, set tokenizer state to the WebVTT start tag annotation state, and jump to the step labeled next.
                        buffer = c;
                        tokenizerState = "webvtt_start_tag_annotation";
                        position++;
                        continue;
                    }
                    break;
                    case '\u002E':
                    {
                        // Set tokenizer state to the WebVTT start tag class state, and jump to the step labeled next.
                        tokenizerState = "webvtt_start_tag_class";
                        position++;
                        continue;
                    }
                    break;
                    case '\u003E':
                    {
                        // Advance position to the next character in input, then jump to the next "end-of-file marker" entry below.
                        position++;
                    }
                    case null:
                    {
                        // Return a start tag whose tag name is result, with no classes and no annotation, and abort these steps.
                        return {
                            position,
                            token: {
                                type: "start_tag",
                                tagName: result,
                                classList: []
                            }
                        }
                    }
                    break;
                    default:
                    {
                        // Append c to result and jump to the step labeled next.
                        result += c;
                        position++;
                        continue;
                    }
                    break;
                }
            }
            break; // end webvtt_start_tag
            case 'webvtt_start_tag_class':
            {
                // Jump to the entry that matches the value of c:
                switch (c) {
                    case '\u0009':
                    case '\u000C':
                    case '\u0020':
                    {
                        // Append to classes an entry whose value is buffer, set buffer to the empty string, set tokenizer state to the WebVTT start tag annotation state, and jump to the step labeled next.
                        classes.push(buffer);
                        buffer = "";
                        tokenizerState = "webvtt_start_tag_annotation";
                        position++;
                        continue;
                    }
                    break;
                    case '\u000A':
                    {
                        // Append to classes an entry whose value is buffer, set buffer to c, set tokenizer state to the WebVTT start tag annotation state, and jump to the step labeled next.
                        classes.push(buffer);
                        buffer = c;
                        tokenizerState = "webvtt_start_tag_annotation";
                        position++;
                        continue;
                    }
                    break;
                    case '\u002E':
                    {
                        // Append to classes an entry whose value is buffer, set buffer to the empty string, and jump to the step labeled next.
                        classes.push(buffer);
                        buffer = "";
                        position++;
                        continue;
                    }
                    break;
                    case '\u003E':
                    {
                        // Advance position to the next character in input, then jump to the next "end-of-file marker" entry below.
                        position++;
                    }
                    case null:
                    {
                        // Append to classes an entry whose value is buffer, then return a start tag whose tag name is result, with the classes given in classes but no annotation, and abort these steps.
                        classes.push(buffer);
                        return {
                            position,
                            token: {
                                type: "start_tag",
                                tagName: result,
                                classList: classes
                            }
                        }
                    };
                    break;
                    default:
                    {
                        // Append c to buffer and jump to the step labeled next.
                        buffer += c;
                        position++;
                        continue;
                    }
                    break;
                }
            }
            break; // end webvtt_start_tag_class
            case 'webvtt_start_tag_annotation':
            {
                // Jump to the entry that matches the value of c:
                switch (c) {
                    case '\u0026':
                    {
                        // Set tokenizer state to the HTML character reference in annotation state, and jump to the step labeled next.
                        tokenizerState = "html_character_reference_in_annotation";
                        position++;
                        continue;
                    }
                    break;
                    case '\u003E':
                    {
                        // Advance position to the next character in input, then jump to the next "end-of-file marker" entry below.
                        position++;
                    }
                    case null:
                    {
                        // Remove any leading or trailing ASCII whitespace characters from buffer, and replace any sequence of one or more consecutive ASCII whitespace characters in buffer with a single U+0020 SPACE character; then, return a start tag whose tag name is result, with the classes given in classes, and with buffer as the annotation, and abort these steps.
                        buffer = buffer.trim().replace(/[\u0009\u000A\u000C\u000D\u0020]+/g, " ");
                        return {
                            position,
                            token: {
                                type: "start_tag",
                                tagName: result,
                                classList: classes,
                                annotation: buffer
                            }
                        }
                    }
                    break;
                    default:
                    {
                        // Append c to buffer and jump to the step labeled next.
                        buffer += c;
                        position++;
                        continue;
                    }
                    break;
                }
            }
            break; // end webvtt_start_tag_annotation
            case 'html_character_reference_in_annotation':
            {
                // Attempt to consume an HTML character reference, with the additional allowed character being U+003E GREATER-THAN SIGN (>).
                const { position: newPosition, reference } = consumeCharacterReference(input, position, ">");
                position = newPosition;
                // If nothing is returned, append a U+0026 AMPERSAND character (&) to buffer.
                if (reference === null) {
                    buffer += "&";
                }
                // Otherwise, append the data of the character tokens that were returned to buffer.
                else {
                    buffer += reference;
                }
                // Then, in any case, set tokenizer state to the WebVTT start tag annotation state, and jump to the step labeled next.
                tokenizerState = "webvtt_start_tag_annotation";
                continue;
            }
            break; // end html_character_reference_in_annotation
            case 'webvtt_end_tag':
            {
                // Jump to the entry that matches the value of c:
                switch (c) {
                    case '\u003E':
                    {
                        // Advance position to the next character in input, then jump to the next "end-of-file marker" entry below.
                        position++;
                    }
                    case null:
                    {
                        // Return an end tag whose tag name is result and abort these steps.
                        return {
                            position,
                            token: {
                                type: "end_tag",
                                tagName: result
                            }
                        }
                    }
                    break;
                    default:
                    {
                        // Append c to result and jump to the step labeled next.
                        result += c;
                        position++;
                        continue;
                    }
                    break;
                }
            }
            break; // end webvtt_end_tag
            case 'webvtt_timestamp_tag':
            {
                // Jump to the entry that matches the value of c:
                switch (c) {
                    case '\u003E':
                    {
                        // Advance position to the next character in input, then jump to the next "end-of-file marker" entry below.
                        position++;
                    }
                    case null:
                    {
                        // Return a timestamp tag whose tag name is result and abort these steps.
                        return {
                            position,
                            token: {
                                type: "timestamp",
                                value: result
                            }
                        }
                    }
                    break;
                    default:
                    {
                        // Append c to result and jump to the step labeled next.
                        result += c;
                        position++;
                        continue;
                    }
                    break;
                }
            }
            break; // end webvtt_timestamp_tag
        }
    }
}

const toUnicodeMap = new Map([
    [0x00, '\uFFFD'],
    [0x80, '\u20AC'],
    [0x82, '\u201A'],
    [0x83, '\u0192'],
    [0x84, '\u201E'],
    [0x85, '\u2026'],
    [0x86, '\u2020'],
    [0x87, '\u2021'],
    [0x88, '\u02C6'],
    [0x89, '\u2030'],
    [0x8A, '\u0160'],
    [0x8B, '\u2039'],
    [0x8C, '\u0152'],
    [0x8E, '\u017D'],
    [0x91, '\u2018'],
    [0x92, '\u2019'],
    [0x93, '\u201C'],
    [0x94, '\u201D'],
    [0x95, '\u2022'],
    [0x96, '\u2013'],
    [0x97, '\u2014'],
    [0x98, '\u02DC'],
    [0x99, '\u2122'],
    [0x9A, '\u0161'],
    [0x9B, '\u203A'],
    [0x9C, '\u0153'],
    [0x9E, '\u017E'],
    [0x9F, '\u0178'],
])

// XXX: this is from a very old version of the HTML spec.
// The last reference to this algorithm is in this version of the spec:
// https://html.spec.whatwg.org/commit-snapshots/8c7038df2f83fea748ad269592662c087bfbf066/#consume-a-character-reference
// which is what will be implemented here.
function consumeCharacterReference(input: string, position: number, additionalAllowedCharacter?: string): { position: number, reference: string | null } {
    position++;
    const preparseposition = position;
    if (position >= input.length || ['\u0009', '\u000A', '\u000C', '\u0020', '\u003C', '\u0029'].includes(input.charAt(position)) || additionalAllowedCharacter == input.charAt(position)) {
        // Not a character reference. No characters are consumed, and nothing is returned. (This is not an error, either.)
        return {
            position,
            reference: null
        }
    }
    if (input.charAt(position) == '#') {
        // Consume the U+0023 NUMBER SIGN.
        position++;
        // The behaviour further depends on the character after the U+0023 NUMBER SIGN:
        let type: "dec" | "hex" = "dec";
        if (input.charAt(position).toLowerCase() == 'x') {
            // Consume the X.
            position++;
            type = "hex";
        }
        // Consume as many characters as match the range of characters given above (ASCII hex digits or ASCII digits).
        let consumed = "";
        while (true) {
            if (type == "hex") {
                if (input.charAt(position).match(/[0-9A-Fa-f]/)) {
                    consumed += input.charAt(position);
                    position++;
                } else break;
            } else {
                if (input.charAt(position).match(/[0-9]/)) {
                    consumed += input.charAt(position);
                    position++;
                } else break;
            }
        }
        // If no characters match the range, then don't consume any characters (and unconsume the U+0023 NUMBER SIGN character and, if appropriate, the X character). This is a parse error; nothing is returned.
        if (consumed == "") {
            position--;
            if (type == "hex") position--;
            return {
                position,
                reference: null,
            }
        }
        // Otherwise, if the next character is a U+003B SEMICOLON, consume that too. If it isn't, there is a parse error.
        if (input.charAt(position) != ';') {
            return {
                position: preparseposition,
                reference: null,
            }
        } else position++;
        // If one or more characters match the range, then take them all and interpret the string of characters as a number (either hexadecimal or decimal as appropriate).
        let codePoint: number = type == "hex" ? parseInt(consumed, 16) : parseInt(consumed, 10);
        // If that number is one of the numbers in the first column of the following table, then this is a parse error. Find the row with that number in the first column, and return a character token for the Unicode character given in the second column of that row.
        if (toUnicodeMap.has(codePoint))
            return {
                position,
                reference: toUnicodeMap.get(codePoint)!,
            };
        // Otherwise, if the number is in the range 0xD800 to 0xDFFF or is greater than 0x10FFFF, then this is a parse error. Return a U+FFFD REPLACEMENT CHARACTER character token.
        if (codePoint >= 0xD800 && codePoint <= 0xDFFF || codePoint > 0x10FFFF) {
            return {
                position,
                reference: '\uFFFD',
            };
        }
        // Otherwise, return a character token for the Unicode character whose code point is that number. 
        return {
            position,
            reference: String.fromCodePoint(codePoint),
        }
    } else {
        // Consume the maximum number of characters possible, with the consumed characters matching one of the identifiers in the first column of the named character references table (in a case-sensitive manner).
        let consumed = "";
        // XXX: they're all ASCII alpha and optionally end with a semicolon, so we may use a regex.
        while (true) {
            if (input.charAt(position).match(/[a-zA-Z;]/)) {
                consumed += input.charAt(position);
                position++;
            } else break;
        }
        // If no match can be made, then no characters are consumed, and nothing is returned. In this case, if the characters after the U+0026 AMPERSAND character (&) consist of a sequence of one or more alphanumeric ASCII characters followed by a U+003B SEMICOLON character (;), then this is a parse error.
        if (!Object.hasOwn(named_character_reference, consumed)) {
            return {
                position: preparseposition,
                reference: null,
            }
        }
        // XXX: this context is not "part of an attribute" so we don't need to check for the semicolon.
        // Otherwise, a character reference is parsed. If the last character matched is not a U+003B SEMICOLON character (;), there is a parse error.
        return {
            position,
            reference: named_character_reference[consumed]!.characters,
        }
    }
}