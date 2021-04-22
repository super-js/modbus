export function isUInt8(value: number) {
    return !(value > 0xff);
}

export function isUInt16(value: number) {
    return !(value > 0xffff);
}