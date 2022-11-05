import TextTrack, { TextTrackKind } from './TextTrack';
import TextTrackCue from './VTTCue';
import VTTRegion from './VTTRegion';

export default class VTTParser {
    // 2. Let position be a pointer into input, initially pointing at the start of the string.
    #position: number = 0;
    #input: string = "";
    // 3. Let seen cue be false.
    #seenCue: boolean = false;
    #cues: TextTrackCue[] = [];
    #stylesheets: any[] = [];
    // 13. Let regions be an empty text track list of regions.
    #regions: VTTRegion[] = [];

    constructor(input: string) {
        this.#input = this.#prepare(input);
        this.#parse();
    }

    get regions() {
        return [...this.#regions];
    }

    get cues() {
        return [...this.#cues];
    }

    textTrack(kind: TextTrackKind, language?: string, label?: string , id?: string): TextTrack {
        // TODO: Implement this correctly
        const textTrack = new TextTrack(kind, "hidden", label, language, id);
        for (const cue of this.#cues) {
            cue.track = textTrack;
            textTrack.addCue(cue);
        }
        for (const region of this.#regions) {
            textTrack._addRegion(region);
        }
        return textTrack;
    }

    #peak() {
        return this.#input.charAt(this.#position);
    }

    #prepare(chunk: string) {
        let prepared = chunk;
        // 1. Let input be the string being parsed, after conversion to Unicode, and with the following transformations applied:
        // - Replace all U+0000 NULL characters by U+FFFD REPLACEMENT CHARACTERs.
        prepared = prepared.replace(/\u0000/g, "\uFFFD");
        // - Replace each U+000D CARRIAGE RETURN U+000A LINE FEED (CRLF) character pair by a single U+000A LINE FEED (LF) character.
        prepared = prepared.replace(/\u000D\u000A/g, "\u000A");
        // - Replace all remaining U+000D CARRIAGE RETURN characters by U+000A LINE FEED (LF) characters.
        prepared = prepared.replace(/\u000D/g, "\u000A");

        return prepared;
    }

    #collectLine() {
        // 7. collect a sequence of code points that are not U+000A LINE FEED (LF) characters.
        let line = "";
        while (this.#position < this.#input.length && this.#peak() !== "\u000A") {
            line += this.#input.charAt(this.#position);
            this.#position++;
        }
        return line;
    }

    get #eof() {
        return this.#position >= this.#input.length;
    }

    #collectBlock(inHeader: boolean) {
        // 2. Let line count be zero.
        let lineCount = 0;
        // 3. Let previous position be position.
        let previousPosition = this.#position;
        // 4. Let line be the empty string.
        let line = "";
        // 5. Let buffer be the empty string.
        let buffer = "";
        // 6. Let seen EOF be false.
        let seenEOF = false;
        // 7. Let seen arrow be false.
        let seenArrow = false;
        // 8. Let cue be null.
        let cue: TextTrackCue | null = null;
        // 9. Let stylesheet be null.
        let stylesheet = null;
        // 10. Let region be null.
        let region: VTTRegion | null = null;
        // 11. Loop: Run these substeps in a loop:
        while (true) {
            // 1. collect a sequence of code points that are not U+000A LINE FEED (LF) characters. Let line be those characters, if any.
            line = this.#collectLine();
            // 2. Increment line count by 1.
            lineCount++;
            // 3. If position is past the end of input, let seen EOF be true. Otherwise, the character indicated by position is a U+000A LINE FEED (LF) character; advance position to the next character in input.
            if (this.#eof) 
                seenEOF = true;
            else
                this.#position++;
            // 4. If line contains the three-character substring "-->" (U+002D HYPHEN-MINUS, U+002D HYPHEN-MINUS, U+003E GREATER-THAN SIGN), then run these substeps:
            if (line.includes("-->"))  {
                // 1. If in header is not set and at least one of the following conditions are true:
                // - line count is 1
                // - line count is 2 and seen arrow is false
                if (!inHeader && ((lineCount === 1 ) || (lineCount === 2 && !seenArrow))) {
                    // 1. Let seen arrow be true.
                    seenArrow = true;
                    // 2. Let previous position be position.
                    previousPosition = this.#position;
                    // 3. Cue creation: Let cue be a new WebVTT cue and initialize it as follows:
                    cue = new TextTrackCue(0, 0, "");
                    cue.id = buffer;
                    // 4. Collect WebVTT cue timings and settings from line using regions for cue. If that fails, let cue be null. Otherwise, let buffer be the empty string and let seen cue be true.
                    const { success } = this.#collectCueTimingsAndSettings(line, this.#regions, cue);
                    if (!success) {
                        cue = null;
                    } else {
                        buffer = "";
                        this.#seenCue = true;
                    }
                // Otherwise, let position be previous position and break out of loop.
                } else {
                    this.#position = previousPosition;
                    break;
                }
            // 5. Otherwise, if line is the empty string, break out of loop.
            } else if (line == "") {
                break;
            // 6. Otherwise, run these substeps:
            } else {
                // 1. If in header is not set and line count is 2, run these substeps:
                if (!inHeader && lineCount === 2) {
                    // 1. If seen cue is false and buffer starts with the substring "STYLE" (U+0053 LATIN CAPITAL LETTER S, U+0054 LATIN CAPITAL LETTER T, U+0059 LATIN CAPITAL LETTER Y, U+004C LATIN CAPITAL LETTER L, U+0045 LATIN CAPITAL LETTER E), and the remaining characters in buffer (if any) are all ASCII whitespace, then run these substeps:
                    if (!this.#seenCue && buffer.startsWith("STYLE") && buffer.substring(5).trim() === "") {
                        // TODO: stylesheet implementation
                    }
                    // 2. Otherwise, if seen cue is false and buffer starts with the substring "REGION" (U+0052 LATIN CAPITAL LETTER R, U+0045 LATIN CAPITAL LETTER E, U+0047 LATIN CAPITAL LETTER G, U+0049 LATIN CAPITAL LETTER I, U+004F LATIN CAPITAL LETTER O, U+004E LATIN CAPITAL LETTER N), and the remaining characters in buffer (if any) are all ASCII whitespace, then run these substeps:
                    else if (!this.#seenCue && buffer.startsWith("REGION") && buffer.substring(6).trim() === "") {
                        // 1. Region creation: Let region be a new WebVTT region.
                        region = new VTTRegion();
                        // 8. Let buffer be the empty string.
                        buffer = "";
                    }
                }
                // 2. If buffer is not the empty string, append a U+000A LINE FEED (LF) character to buffer.
                if (buffer !== "") 
                    buffer += "\u000A";
                // 3. Append line to buffer.
                buffer += line;
                // 4. Let previous position be position.
                previousPosition = this.#position;
            }
            if (seenEOF) break;
        }
        // 12. If cue is not null, let the cue text of cue be buffer, and return cue.
        if (cue !== null) 
            cue.text = buffer;
        // 13. Otherwise, if stylesheet is not null, then Parse a stylesheet from buffer. If it returned a list of rules, assign the list as stylesheet’s CSS rules; otherwise, set stylesheet’s CSS rules to an empty list. [CSSOM] [CSS-SYNTAX-3] Finally, return stylesheet.
        else if (stylesheet !== null) {
            // TODO: stylesheet implementation
        }
        // 14. Otherwise, if region is not null, then collect WebVTT region settings from buffer using region for the results. Construct a WebVTT Region Object from region, and return it.
        else if (region !== null) {
            this.#collectRegionSettings(buffer, region);
        }
        return {
            cue,
            region,
            stylesheet
        }
    }

    #collectRegionSettings(input: string, region: VTTRegion) {
        // 1. Let settings be the result of splitting input on spaces.
        const settings = input.split(" ");
        // 2. For each token setting in the list settings, run the following substeps:
        for (const setting of settings) {
            // 1. If setting does not contain a U+003A COLON character (:), or if the first U+003A COLON character (:) in setting is either the first or last character of setting, then jump to the step labeled next setting.
            if (!setting.includes(":") || setting.indexOf(":") === 0 || setting.indexOf(":") === setting.length - 1) 
                continue;
            // 2. Let name be the leading substring of setting up to and excluding the first U+003A COLON character (:) in that string.
            const name = setting.substring(0, setting.indexOf(":"));
            // 3. Let value be the trailing substring of setting starting from the character immediately after the first U+003A COLON character (:) in that string.
            const value = setting.substring(setting.indexOf(":") + 1);
            // 4. Run the appropriate substeps that apply for the value of name, as follows:
            switch (name) {
                // - If name is a case-sensitive match for "id"
                case "id":
                {
                    // Let region’s identifier be value.
                    region.id = value;
                }
                break;
                // - Otherwise if name is a case-sensitive match for "width"
                case "width":
                {
                    // If parse a percentage string from value returns a percentage, let region’s WebVTT region width be percentage.
                    const percentage = this.#parsePercentString(value);
                    if (percentage !== null)
                        region.width = percentage;
                }
                break;
                // - Otherwise if name is a case-sensitive match for "lines"
                case "lines":
                {
                    // 1. If value contains any characters other than ASCII digits, then jump to the step labeled next setting.
                    if (value.match(/[^0-9]/g))
                        continue;
                    // 2. Interpret value as an integer, and let number be that number.
                    // 3. Let region’s WebVTT region lines be number.
                    region.lines = parseInt(value);
                }
                break;
                // - Otherwise if name is a case-sensitive match for "regionanchor"
                case "regionanchor":
                {
                    // 1. If value does not contain a U+002C COMMA character (,), then jump to the step labeled next setting.
                    if (!value.includes(","))
                        continue;
                    // 2. Let anchorX be the leading substring of value up to and excluding the first U+002C COMMA character (,) in that string.
                    const anchorX = value.substring(0, value.indexOf(","));
                    // 3. Let anchorY be the trailing substring of value starting from the character immediately after the first U+002C COMMA character (,) in that string.
                    const anchorY = value.substring(value.indexOf(",") + 1);
                    // 4. If parse a percentage string from anchorX or parse a percentage string from anchorY don’t return a percentage, then jump to the step labeled next setting.
                    const percentageX = this.#parsePercentString(anchorX);
                    const percentageY = this.#parsePercentString(anchorY);
                    if (percentageX === null || percentageY === null)
                        continue;
                    // 5. Let region’s WebVTT region anchor point be the tuple of the percentage values calculated from anchorX and anchorY.
                    region.regionAnchorX = percentageX;
                    region.regionAnchorY = percentageY;
                }
                break;
                // - Otherwise if name is a case-sensitive match for "viewportanchor"
                case "viewportanchor":
                {
                    // 1. If value does not contain a U+002C COMMA character (,), then jump to the step labeled next setting.
                    if (!value.includes(","))
                        continue;
                    // 2. Let viewportanchorX be the leading substring of value up to and excluding the first U+002C COMMA character (,) in that string.
                    const viewportanchorX = value.substring(0, value.indexOf(","));
                    // 3. Let viewportanchorY be the trailing substring of value starting from the character immediately after the first U+002C COMMA character (,) in that string.
                    const viewportanchorY = value.substring(value.indexOf(",") + 1);
                    // 4. If parse a percentage string from viewportanchorX or parse a percentage string from viewportanchorY don’t return a percentage, then jump to the step labeled next setting.
                    const percentageX = this.#parsePercentString(viewportanchorX);
                    const percentageY = this.#parsePercentString(viewportanchorY);
                    if (percentageX === null || percentageY === null)
                        continue;
                    // 5. Let region’s WebVTT region viewport anchor point be the tuple of the percentage values calculated from viewportanchorX and viewportanchorY.
                    region.viewportAnchorX = percentageX;
                    region.viewportAnchorY = percentageY;
                }
                break;
                // - Otherwise if name is a case-sensitive match for "scroll"
                case "scroll":
                {
                    // 1. If value is a case-sensitive match for the string "up", then let region’s scroll value be up.
                    if (value === "up")
                        region.scroll = "up"
                }
                break;
            }
        }
    }

    #skipWhitespace(input: string, position: number) {
        while (position < input.length && ['\u0009', '\u000A', '\u000C', '\u000D', '\u0020'].includes(input.charAt(position))) {
            position++;
        }

        return position;
    }

    // When the algorithm above says to collect WebVTT cue timings and settings from a string input using a text track list of regions regions for a WebVTT cue cue, the user agent must run the following algorithm.
    #collectCueTimingsAndSettings(input: string, regions: VTTRegion[], cue: TextTrackCue) {
        // 2. Let position be a pointer into input, initially pointing at the start of the string.
        let position = 0;
        // 3. Skip whitespace.
        // - ASCII whitespace is U+0009 TAB, U+000A LF, U+000C FF, U+000D CR, or U+0020 SPACE.
        position = this.#skipWhitespace(input, position);
        // 4. Collect a WebVTT timestamp. If that algorithm fails, then abort these steps and return failure. Otherwise, let cue’s text track cue start time be the collected time.
        let { position: newPosition, time, success } = VTTParser.collectTimestamp(input, position);
        position = newPosition;
        if (!success) {
            return {
                success: false,
            }
        }
        cue.startTime = time;
        // 5. Skip whitespace.
        position = this.#skipWhitespace(input, position);
        // 6. If the character at position is not a U+002D HYPHEN-MINUS character (-) then abort these steps and return failure. Otherwise, move position forwards one character.
        if (input.charAt(position) !== "-") {
            return {
                success: false,
            }
        }
        position++;
        // 7. If the character at position is not a U+002D HYPHEN-MINUS character (-) then abort these steps and return failure. Otherwise, move position forwards one character.
        if (input.charAt(position) !== "-") {
            return {
                success: false,
            }
        }
        position++;
        // 8. If the character at position is not a U+003E GREATER-THAN SIGN character (>) then abort these steps and return failure. Otherwise, move position forwards one character.
        if (input.charAt(position) !== ">") {
            return {
                success: false,
            }
        }
        position++;
        // 9. Skip whitespace.
        position = this.#skipWhitespace(input, position);
        // 10. Collect a WebVTT timestamp. If that algorithm fails, then abort these steps and return failure. Otherwise, let cue’s text track cue end time be the collected time.
        const { position: newPosition2, time: time2, success: success2 } = VTTParser.collectTimestamp(input, position);
        position = newPosition2;
        if (!success2) {
            return {
                success: false,
            }
        }
        cue.endTime = time2;
        // 11. Let remainder be the trailing substring of input starting at position.
        const remainder = input.substring(position);
        // 12. Parse the WebVTT cue settings from remainder using regions for cue.
        this.#parseCueSettings(remainder, regions, cue);

        return {
            success: true,
        }
    }

    #parseCueSettings(input: string, regions: VTTRegion[], cue: TextTrackCue) {
        // 1. Let settings be the result of splitting input on spaces.
        const settings = input.split(" ");
        // 2. For each token setting in the list settings, run the following substeps:
        for (const setting of settings) {
            // 1. If setting does not contain a U+003A COLON character (:), or if the first U+003A COLON character (:) in setting is either the first or last character of setting, then jump to the step labeled next setting.
            if (!setting.includes(":") || setting.indexOf(":") === 0 || setting.indexOf(":") === setting.length - 1) {
                continue;
            }
            // 2. Let name be the leading substring of setting up to and excluding the first U+003A COLON character (:) in that string.
            const name = setting.substring(0, setting.indexOf(":"));
            // 3. Let value be the trailing substring of setting starting from the character immediately after the first U+003A COLON character (:) in that string.
            const value = setting.substring(setting.indexOf(":") + 1);
            // 4. Run the appropriate substeps that apply for the value of name, as follows:
            switch (name) {
                // - If name is case-sensitive match for "region"
                case "region":
                {
                    // 1. Let cue’s WebVTT cue region be the last WebVTT region in regions whose WebVTT region identifier is value, if any, or null otherwise.
                    cue.region = regions.filter(region => region.id === value).pop() || null;
                }
                break;
                // - If nanme is a case-sensitive match for "vertical"
                case "vertical":
                {
                    // 1. If value is a case-sensitive match for the string "rl", then let cue’s WebVTT cue writing direction be vertical growing left.
                    if (value === "rl") 
                        cue.vertical = "rl";
                    // 2. Otherwise, if value is a case-sensitive match for the string "lr", then let cue’s WebVTT cue writing direction be vertical growing right.
                    else if (value === "lr")
                        cue.vertical = "lr";
                    
                    // 3. If cue’s WebVTT cue writing direction is not horizontal, let cue’s WebVTT cue region be null (there are no vertical regions).
                    if (cue.vertical !== "")
                        cue.region = null;
                }
                break;
                // - If name is a case-sensitive match for "line"
                case "line":
                {
                    // 1. If value contains a U+002C COMMA character (,), then let linepos be the leading substring of value up to and excluding the first U+002C COMMA character (,) in that string and let linealign be the trailing substring of value starting from the character immediately after the first U+002C COMMA character (,) in that string.
                    // 2. Otherwise let linepos be the full value string and linealign be null.
                    const linepos = value.includes(",") ? value.substring(0, value.indexOf(",")) : value;
                    const linealign = value.includes(",") ? value.substring(value.indexOf(",") + 1) : null;
                    // 3. If linepos does not contain at least one ASCII digit, then jump to the step labeled next setting.
                    if (!linepos.match(/[0-9]/g)) {
                        continue;
                    }
                    // 4. If the last character in linepos is a U+0025 PERCENT SIGN character (%)
                    let number = 0;
                    if (linepos.charAt(linepos.length - 1) === "%") {
                        const parsed = this.#parsePercentString(linepos);
                        if (parsed === null) 
                            continue;
                        number = parsed;
                    } else {
                        // 1. If linepos contains any characters other than U+002D HYPHEN-MINUS characters (-), ASCII digits, and U+002E DOT character (.), then jump to the step labeled next setting.
                        if (!linepos.match(/[^-0-9.]/g))
                            continue;
                        // 2. If any character in linepos other than the first character is a U+002D HYPHEN-MINUS character (-), then jump to the step labeled next setting.
                        if (linepos.substring(1).match(/-/g))
                            continue;
                        // 3. If there are more than one U+002E DOT characters (.), then jump to the step labeled next setting.
                        if (linepos.match(/\./g)?.length || 0 > 1)
                            continue;
                        // 4. If there is a U+002E DOT character (.) and the character before or the character after is not an ASCII digit, or if the U+002E DOT character (.) is the first or the last character, then jump to the step labeled next setting.
                        if (linepos.includes(".") && (linepos.charAt(0) === '.' || linepos.charAt(linepos.length - 1) === '.' || !linepos.charAt(linepos.indexOf(".") -1).match(/[0-9]/g)) || !linepos.charAt(linepos.indexOf(".") + 1).match(/[0-9]/g))
                            continue;
                        // 5. Let number be the result of parsing linepos using the rules for parsing floating-point number values. [HTML51]
                        number = parseFloat(linepos);
                        // 6. If number is an error, then jump to the step labeled next setting.
                        if (Number.isNaN(number))
                            continue;
                    }
                    // 5. If linealign is a case-sensitive match for the string "start", then let cue’s WebVTT cue line alignment be start alignment.
                    if (linealign === "start")
                        cue.lineAlign = "start";
                    // 6. Otherwise, if linealign is a case-sensitive match for the string "center", then let cue’s WebVTT cue line alignment be center alignment.
                    else if (linealign === "center")
                        cue.lineAlign = "center";
                    // 7. Otherwise, if linealign is a case-sensitive match for the string "end", then let cue’s WebVTT cue line alignment be end alignment.
                    else if (linealign === "end")
                        cue.lineAlign = "end";
                    // 8. Otherwise, if linealign is not null, then jump to the step labeled next setting.
                    else if (linealign !== null)
                        continue;
                    // 9. Let cue’s WebVTT cue line be number.
                    cue.line = number;
                    // 10. If the last character in linepos is a U+0025 PERCENT SIGN character (%), then let cue’s WebVTT cue snap-to-lines flag be false. Otherwise, let it be true.
                    cue.snapToLines = linepos.charAt(linepos.length - 1) !== "%";
                    // 11. If cue’s WebVTT cue line is not auto, let cue’s WebVTT cue region be null (the cue has been explicitly positioned with a line offset and thus drops out of the region).
                    // XXX: this makes no sense, we're always setting the region to null because we always set the line to a number
                    cue.region = null;
                }
                break;
                // - If name is a case-sensitive match for "position"
                case "position":
                {
                    // 1. If value contains a U+002C COMMA character (,), then let colpos be the leading substring of value up to and excluding the first U+002C COMMA character (,) in that string and let colalign be the trailing substring of value starting from the character immediately after the first U+002C COMMA character (,) in that string.
                    // 2. Otherwise let colpos be the full value string and colalign be null.
                    const colpos = value.includes(",") ? value.substring(0, value.indexOf(",")) : value;
                    const colalign = value.includes(",") ? value.substring(value.indexOf(",") + 1) : null;
                    // 3. If parse a percentage string from colpos doesn’t fail, let number be the returned percentage, otherwise jump to the step labeled next setting (position’s value remains the special value auto).
                    let number = 0;
                    const percentage = this.#parsePercentString(colpos);
                    if (percentage !== null)
                        number = percentage;
                    else continue;
                    // 4. If colalign is a case-sensitive match for the string "line-left", then let cue’s WebVTT cue position alignment be line-left alignment.
                    if (colalign === "line-left")
                        cue.positionAlign = "line-left";
                    // 5. Otherwise, if colalign is a case-sensitive match for the string "center", then let cue’s WebVTT cue position alignment be center alignment.
                    else if (colalign === "center")
                        cue.positionAlign = "center";
                    // 6. Otherwise, if colalign is a case-sensitive match for the string "line-right", then let cue’s WebVTT cue position alignment be line-right alignment.
                    else if (colalign === "line-right")
                        cue.positionAlign = "line-right";
                    // 7. Otherwise, if colalign is not null, then jump to the step labeled next setting.
                    else if (colalign !== null)
                        continue;
                    // 8. Let cue’s position be number.
                    cue.position = number;
                } 
                break;
                // - If name is a case-sensitive match for "size"
                case "size":
                {
                    // 1. If parse a percentage string from value doesn’t fail, let number be the returned percentage, otherwise jump to the step labeled next setting.
                    const number = this.#parsePercentString(value);
                    if (number === null)
                        continue;
                    // 2. Let cue’s WebVTT cue size be number.
                    cue.size = number;
                    // 3. If cue’s WebVTT cue size is not 100, let cue’s WebVTT cue region be null (the cue has been explicitly sized and thus drops out of the region).
                    if (cue.size !== 100)
                        cue.region = null;
                }
                break;
                // - If name is a case-sensitive match for "align"
                case "align":
                {
                    if ((["start", "end", "center", "end", "left", "right"]).includes(value)) 
                        cue.align = value as AlignSetting;
                }
                break;
            }
        }
    }

    #parsePercentString(input: string) {
        // 2. If input does not match the syntax for a WebVTT percentage, then fail.
        if (!input.match(/^[0-9]+([.][0-9]+)?[%]$/g)) 
            return null;
        // 3. Remove the last character from input.
        input = input.substring(0, input.length - 1);
        // 4. Let percentage be the result of parsing input using the rules for parsing floating-point number values. [HTML51]
        const percentage = parseFloat(input);
        // 5. If percentage is an error, is less than 0, or is greater than 100, then fail.
        if (Number.isNaN(percentage) || percentage < 0 || percentage > 100)
            return null;
        // 6. Return percentage.
        return percentage;
    }

    static collectTimestamp(input: string, position: number) {
        // 2. Let most significant units be minutes.
        let mostSignificantUnits = "minutes";
        // 3. If position is past the end of input, return an error and abort these steps.
        if (position >= input.length) {
            return {
                position,
                time: 0,
                success: false,
            }
        }
        // 4. If the character indicated by position is not an ASCII digit, then return an error and abort these steps.
        // - An ASCII digit is a code point in the range U+0030 (0) to U+0039 (9), inclusive.
        if (input.charCodeAt(position) < 0x0030 || input.charCodeAt(position) > 0x0039) {
            return {
                position,
                time: 0,
                success: false,
            }
        }
        // 5. Collect a sequence of code points that are ASCII digits, and let string be the collected substring.
        const newPosition = this.collectDigits(input, position);
        let string = input.substring(position, newPosition);
        position = newPosition;
        // 6. Interpret string as a base-ten integer. Let value1 be that integer.
        let value1 = parseInt(string);
        // 7. If string is not exactly two characters in length, or if value1 is greater than 59, let most significant units be hours.
        if (string.length !== 2 || value1 > 59) {
            mostSignificantUnits = "hours";
        }
        // 8. If position is beyond the end of input or if the character at position is not a U+003A COLON character (:), then return an error and abort these steps. Otherwise, move position forwards one character.
        if (position >= input.length || input.charAt(position) !== ":") {
            return {
                position,
                time: 0,
                success: false,
            }
        }
        position++;
        // 9. collect a sequence of code points that are ASCII digits, and let string be the collected substring.
        const newPosition2 = this.collectDigits(input, position);
        string = input.substring(position, newPosition2);
        position = newPosition2;
        // 10. If string is not exactly two characters in length, return an error and abort these steps.
        if (string.length !== 2) {
            return {
                position,
                time: 0,
                success: false,
            }
        }
        // 11. Interpret string as a base-ten integer. Let value2 be that integer.
        let value2 = parseInt(string);
        let value3 = 0;
        // 12. If most significant units is hours, or if position is not beyond the end of input and the character at position is a U+003A COLON character (:), run these substeps:
        if (mostSignificantUnits === "hours" || (position < input.length && input.charAt(position) === ":")) {
            // 1. If position is beyond the end of input or if the character at position is not a U+003A COLON character (:), then return an error and abort these steps. Otherwise, move position forwards one character.
            if (position >= input.length || input.charAt(position) !== ":") {
                return {
                    position,
                    time: 0,
                    success: false,
                }
            }
            position++;
            // 2. collect a sequence of code points that are ASCII digits, and let string be the collected substring.
            const newPosition3 = this.collectDigits(input, position);
            string = input.substring(position, newPosition3);
            position = newPosition3;
            // 3. If string is not exactly two characters in length, return an error and abort these steps.
            if (string.length !== 2) {
                return {
                    position,
                    time: 0,
                    success: false,
                }
            }
            // 4. Interpret string as a base-ten integer. Let value3 be that integer.
            value3 = parseInt(string);
        // Otherwise (if most significant units is not hours, and either position is beyond the end of input, or the character at position is not a U+003A COLON character (:)), let value3 have the value of value2, then value2 have the value of value1, then let value1 equal zero.
        } else {
            value3 = value2;
            value2 = value1;
            value1 = 0;
        }
        // 13. If position is beyond the end of input or if the character at position is not a U+002E FULL STOP character (.), then return an error and abort these steps. Otherwise, move position forwards one character.
        if (position >= input.length || input.charAt(position) !== ".") {
            return {
                position,
                time: 0,
                success: false,
            }
        }
        position++;
        // 14. collect a sequence of code points that are ASCII digits, and let string be the collected substring.
        const newPosition4 = this.collectDigits(input, position);
        string = input.substring(position, newPosition4);
        position = newPosition4;
        // 15. If string is not exactly three characters in length, return an error and abort these steps.
        if (string.length !== 3) {
            return {
                position,
                time: 0,
                success: false,
            }
        }
        // 16. Interpret string as a base-ten integer. Let value4 be that integer.
        let value4 = parseInt(string);
        // 17. If value2 is greater than 59 or if value3 is greater than 59, return an error and abort these steps.
        if (value2 > 59 || value3 > 59) {
            return {
                position,
                time: 0,
                success: false,
            }
        }
        // 18. Let result be value1×60×60 + value2×60 + value3 + value4∕1000.
        let result = value1 * 60 * 60 + value2 * 60 + value3 + value4 / 1000;
        // 19. Return result.
        return {
            position,
            time: result,
            success: true,
        };
    }

    static collectDigits(input: string, position: number) {
        while (position < input.length && input.charCodeAt(position) >= 0x0030 && input.charCodeAt(position) <= 0x0039) {
            position++;
        }

        return position;
    }

    #collectWhitespace() {
        while (this.#peak() == "\u000A") {
            this.#position++;
        }
    }

    #parse() {
        // 4. If input is less than six characters long, then abort these steps. The file does not start with the correct WebVTT file signature and was therefore not successfully processed.
        if (this.#input.length < 6) {
            throw new Error("Invalid WebVTT file signature");
        }
        // 5. If input is exactly six characters long but does not exactly equal "WEBVTT", then abort these steps. The file does not start with the correct WebVTT file signature and was therefore not successfully processed.
        if (this.#input.length === 6 && this.#input !== "WEBVTT") {
            throw new Error("Invalid WebVTT file signature");
        }
        // 6. If input is more than six characters long but the first six characters do not exactly equal "WEBVTT", or the seventh character is not a U+0020 SPACE character, a U+0009 CHARACTER TABULATION (tab) character, or a U+000A LINE FEED (LF) character, then abort these steps. The file does not start with the correct WebVTT file signature and was therefore not successfully processed.
        if (this.#input.length > 6 && (this.#input.slice(0, 6) !== "WEBVTT" || !/\u0020|\u0009|\u000A/.test(this.#input.charAt(6)))) {
            throw new Error("Invalid WebVTT file signature");
        }
        // 7. collect a sequence of code points that are not U+000A LINE FEED (LF) characters.
        let line = this.#collectLine();
        // 8. If position is past the end of input, then abort these steps. The file was successfully processed, but it contains no useful data and so no WebVTT cues were added to output.
        if (this.#eof) return;
        // 9. The character indicated by position is a U+000A LINE FEED (LF) character. Advance position to the next character in input.
        this.#position++;
        // 10. If position is past the end of input, then abort these steps. The file was successfully processed, but it contains no useful data and so no WebVTT cues were added to output.
        if (this.#eof) return;
        // 11. Header: If the character indicated by position is not a U+000A LINE FEED (LF) character, then collect a WebVTT block with the in header flag set. Otherwise, advance position to the next character in input.
        if (this.#peak() == "\u000A") {
            this.#position++;
        } else {
            this.#collectBlock(true);
        }
        // 12. collect a sequence of code points that are U+000A LINE FEED (LF) characters.
        this.#collectWhitespace();
        // 14. Block loop: While position doesn’t point past the end of input:
        while (!this.#eof) {
            // 1. Collect a WebVTT block, and let block be the returned value.
            const block = this.#collectBlock(false);
            // 2. If block is a WebVTT cue, add block to the text track list of cues output.
            if (block.cue) {
                this.#cues.push(block.cue);
            }
            // 3. Otherwise, if block is a CSS style sheet, add block to stylesheets.
            else if (block.stylesheet) {
                this.#stylesheets.push(block.stylesheet);
            }
            // 4. Otherwise, if block is a WebVTT region object, add block to regions.
            else if (block.region) {
                this.#regions.push(block.region);
            }
            // 5. collect a sequence of code points that are U+000A LINE FEED (LF) characters.
            this.#collectWhitespace();
        }
        // 15. End: The file has ended. Abort these steps. The WebVTT parser has finished. The file was successfully processed.
        return;
    }
}