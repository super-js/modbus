import {isUInt8} from "../utils";
import {ModbusResponse} from "../modbus-reponse";
import {Buffer} from "buffer";

export interface IModbusRequestOptions {
    message: Buffer;
    unitId?: number;
    address: number;
    transactionId: number;
    data: number;
    functionCode: number;
    expectedResponseBodySize: number;
}

export type TModbusRequestStatus = 'READY' | 'PROCESSING' | 'COMPLETED';

export class BuildModbusRequestError extends Error {

}

export abstract class ModbusRequest {

    private static DEFAULT_UNIT_ID = 0x01;
    protected static FUNCTION_CODE = 0x00;
    protected static readonly MODBUS_HEADER_SIZE = 7;

    private _header: Buffer;
    private _message: Buffer;

    private _unitId: number;
    private _address: number;
    private _transactionId: number;
    private _data: number;
    private _functionCode: number;

    private _status: TModbusRequestStatus = 'READY';
    private _response?: ModbusResponse;

    abstract get result(): any;

    constructor(options: IModbusRequestOptions) {

        this._unitId = options.unitId || ModbusRequest.DEFAULT_UNIT_ID;
        this._address = options.address;
        this._transactionId = options.transactionId;
        this._data = options.data;
        this._message = options.message;
        this._functionCode = options.functionCode;

        if(!isUInt8(this._unitId)) throw new BuildModbusRequestError(`Invalid Unit ID: ${this._unitId}`);

        this._header = Buffer.alloc(ModbusRequest.MODBUS_HEADER_SIZE);

        this._header.writeUInt16BE(this._transactionId, 0); // Transaction
        this._header.writeUInt16BE(0x0000, 2); // Modbus protocol
        this._header.writeUInt16BE(this._message.length + 1, 4); // Length of message + unit id
        this._header.writeUInt8(this._unitId, 6); // Unit id

        this._response = ModbusResponse.build({
            expectedBufferSize: options.expectedResponseBodySize + ModbusRequest.MODBUS_HEADER_SIZE
        });

    }

    static build(options: IModbusRequestOptions): ModbusRequest {
        return null;
    }

    updateResponseBuffer(buffer: Buffer) {
        this._response.buffer = buffer;
    }

    get buffer(): Buffer {
        return Buffer.concat([this._header, this._message])
    }

    get status(): TModbusRequestStatus {
        return this._status
    }

    set status(status: TModbusRequestStatus) {
        this._status = status;
    }

    get transactionId(): number {
        return this._transactionId;
    }

    get isComplete(): boolean {
        return this._response && this._response.isComplete;
    }

    protected get response(): ModbusResponse {
        return this._response;
    }

}