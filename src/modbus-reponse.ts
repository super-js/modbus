
export interface IModbusResponseOptions {
    buffer: Buffer;
}

export class ModbusResponse {

    private _buffer: Buffer;

    constructor(options: IModbusResponseOptions) {
        this._buffer = options.buffer;
    }

    static build(options: IModbusResponseOptions): ModbusResponse {
        return new ModbusResponse(options);
    }

    get buffer(): Buffer {
        return this._buffer;
    }

    get transactionId(): number {
        return this._buffer.readUIntBE(0, 2)
    }
}