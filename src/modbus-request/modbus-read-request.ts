import {IModbusRequestOptions, ModbusRequest} from "./modbus-request";
import {Buffer} from "buffer";

export interface IModbusReadRequestOptions extends Omit<IModbusRequestOptions, 'message'> {
    readLength: number;
    readByteLength: number;
}

export abstract class ModbusReadRequest extends ModbusRequest {

    protected static readonly MESSAGE_SIZE: number = 5;

    protected readonly readLength: number;
    protected readonly readByteLength: number;

    private readonly _resultBuffer: Buffer;

    protected constructor(options: IModbusReadRequestOptions) {

        const {readLength, readByteLength, ...modbusRequestOptions} = options;

        const message = Buffer.alloc(ModbusReadRequest.MESSAGE_SIZE);

        message.writeUInt8(options.functionCode,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(readLength,3);

        super({
            ...modbusRequestOptions,
            message
        });

        this.readLength = readLength;
        this.readByteLength = readByteLength;
        this._resultBuffer = Buffer.alloc(readByteLength);
    }

    protected get resultBuffer() {

        this.response.buffer.copy(
            this._resultBuffer,
            0,
            this.response.buffer.length - this.readByteLength
        );

        return this._resultBuffer;
    }
}