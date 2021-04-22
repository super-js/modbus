export interface IModbusResponseOptions {
    buffer?: Buffer;
    expectedBufferSize: number;
}

export class ModbusResponse {

    private _buffer: Buffer;
    private readonly _expectedBufferSize: number;

    constructor(options: IModbusResponseOptions) {
        this._buffer = options?.buffer || Buffer.alloc(0);
        this._expectedBufferSize = options.expectedBufferSize;
    }

    static build(options: IModbusResponseOptions): ModbusResponse {
        return new ModbusResponse(options);
    }

    set buffer(buffer: Buffer) {
        this._buffer = Buffer.concat([this._buffer, buffer]);
    }

    get buffer(): Buffer {
        return this._buffer;
    }

    get transactionId(): number {
        return this._buffer.length > 2 ? this._buffer.readUIntBE(0, 2) : null;
    }

    get isComplete(): boolean {
        return this._buffer.length === this._expectedBufferSize;
    }
}