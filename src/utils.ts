export function isUInt8(value: number) {
    return !(value > 0xff);
}

export function isUInt16(value: number) {
    return !(value > 0xffff);
}

export function getTransactionIdFromBuffer(buffer: Buffer): number {
    return buffer.length > 2 ? buffer.readUIntBE(0, 2) : null;
}