export function isUInt8(value: number) {
    return !(value > 0xff) && value > 0;
}

export function isInt8(value: number) {
    return !(value > 0xff) && value > -128;
}

export function isUInt16(value: number) {
    return !(value > 0xffff) && value > 0;
}

export function isInt16(value: number) {
    return !(value > 0x7fff) && value > -32768;
}