// @flow
/**
 * This file contains a list of utility functions which are useful in other
 * files.
 */

import type {AnyParseNode} from "./parseNode";

/**
 * Return whether an element is contained in a list
 */
const contains = function<T>(list: Array<T>, elem: T): boolean {
    return list.indexOf(elem) !== -1;
};

/**
 * Provide a default value if a setting is undefined
 * NOTE: Couldn't use `T` as the output type due to facebook/flow#5022.
 */
const deflt = function<T>(setting: T | void, defaultIfUndefined: T): * {
    return setting === undefined ? defaultIfUndefined : setting;
};

// hyphenate and escape adapted from Facebook's React under Apache 2 license

const uppercase = /([A-Z])/g;
const hyphenate = function(str: string): string {
    return str.replace(uppercase, "-$1").toLowerCase();
};

const ESCAPE_LOOKUP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    "\"": "&quot;",
    "'": "&#x27;",
};

const ESCAPE_REGEX = /[&><"']/g;

/**
 * Escapes text to prevent scripting attacks.
 */
function escape(text: mixed): string {
    return String(text).replace(ESCAPE_REGEX, match => ESCAPE_LOOKUP[match]);
}

/**
 * Sometimes we want to pull out the innermost element of a group. In most
 * cases, this will just be the group itself, but when ordgroups and colors have
 * a single element, we want to pull that out.
 */
const getBaseElem = function(group: AnyParseNode): AnyParseNode {
    if (group.type === "ordgroup") {
        if (group.body.length === 1) {
            return getBaseElem(group.body[0]);
        } else {
            return group;
        }
    } else if (group.type === "color") {
        if (group.body.length === 1) {
            return getBaseElem(group.body[0]);
        } else {
            return group;
        }
    } else if (group.type === "font") {
        return getBaseElem(group.body);
    } else {
        return group;
    }
};

/**
 * TeXbook algorithms often reference "character boxes", which are simply groups
 * with a single character in them. To decide if something is a character box,
 * we find its innermost group, and see if it is a single character.
 */
const isCharacterBox = function(group: AnyParseNode): boolean {
    const baseElem = getBaseElem(group);

    // These are all they types of groups which hold single characters
    return baseElem.type === "mathord" ||
        baseElem.type === "textord" ||
        baseElem.type === "atom";
};

export const assert = function<T>(value: ?T): T {
    if (!value) {
        throw new Error('Expected non-null, but got ' + String(value));
    }
    return value;
};

/**
 * Accepts a string with one number followed by arbitrary non-numeric characters
 * (e.g., '3.14159px'). Returns the string with the number rounded to the given
 * precision and the original non-numeric characters (e.g., '3.1416px').
 */
export const fixStyleDecimalPlaces = function(
    styleString: string,
    decimalPlaces: number = 4,
): string {
    const sequence = styleString.match(/[\d.-]+|[\D]+/g);
    if (sequence === null) {
        return styleString;
    }
    const value = sequence[0];
    if (isNaN(value)) {
        return styleString;
    }
    const trimmedValue = parseFloat(value).toFixed(decimalPlaces).toString();
    return trimmedValue + sequence.slice(1).join('');
};

export default {
    contains,
    deflt,
    escape,
    hyphenate,
    getBaseElem,
    isCharacterBox,
    fixStyleDecimalPlaces,
};
