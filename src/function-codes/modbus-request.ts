import {isUInt8} from "../utils";
import {ModbusResponse} from "./modbus-reponse";
import {Buffer} from "buffer";

export interface IModbusRequestClientOptions {
    maxNoOfRetries?: number;
    throwErrorOnException?: boolean;
    unitId?: number;
}

export interface IModbusRequestOptions extends IModbusRequestClientOptions {
    message: Buffer;
    unitId?: number;
    address: number;
    transactionId: number;
    data: any;
    functionCode: number;
}

export class BuildModbusRequestError extends Error {

}

export abstract class ModbusRequest<R extends ModbusResponse = ModbusResponse> {

    private static DEFAULT_UNIT_ID = 0x01;
    protected static FUNCTION_CODE = 0x00;
    static readonly MODBUS_HEADER_SIZE = 7;

    private readonly _header: Buffer;
    private readonly _message: Buffer;

    private readonly _unitId: number;
    private readonly _address: number;
    private readonly _transactionId: number;
    private readonly _data: any;
    private readonly _functionCode: number;

    private readonly _maxNoOfRetries: number;
    private _noOfRetries: number = 0;
    private _failedTransactionIds: number[] = [];

    private readonly _throwErrorOnException: boolean = false;

    private _response: R;

    constructor(options: IModbusRequestOptions) {

        this._unitId = options.unitId || ModbusRequest.DEFAULT_UNIT_ID;
        this._address = options.address;
        this._transactionId = options.transactionId;
        this._data = options.data;
        this._message = options.message;
        this._functionCode = options.functionCode;
        this._maxNoOfRetries = options.maxNoOfRetries || 5;
        this._throwErrorOnException = options.throwErrorOnException;

        if(!isUInt8(this._unitId)) throw new BuildModbusRequestError(`Invalid Unit ID: ${this._unitId}`);

        this._header = Buffer.alloc(ModbusRequest.MODBUS_HEADER_SIZE);

        this._header.writeUInt16BE(this._transactionId, 0); // Transaction
        this._header.writeUInt16BE(0x0000, 2); // Modbus protocol
        this._header.writeUInt16BE(this._message.length + 1, 4); // Length of message + unit id
        this._header.writeUInt8(this._unitId, 6); // Unit id

    }

    updateResponseBuffer(buffer: Buffer): Buffer {
        return this._response.updateBuffer(buffer);
    }

    get buffer(): Buffer {
        return Buffer.concat([this._header, this._message])
    }

    get transactionId(): number {
        return this._transactionId;
    }

    get startingAddress(): number {
        return this._address;
    }

    get messageLength(): number {
        return this._message.length;
    }

    get data(): any {
        return this._data;
    }

    get isComplete(): boolean {
        return this._response && this._response.isComplete;
    }

    get response(): R {
        return this._response;
    }

    protected setResponse(response: R) {
        this._response = response;
    }

    increaseNoOfRetries(transactionId?: number) {
        this._failedTransactionIds.push(transactionId);
        this._noOfRetries++;
    }

    get noOfRetries() {
        return this._noOfRetries;
    }

    get failedTransactionIds() {
        return this._failedTransactionIds;
    }

    get failed(): boolean {
        return this._noOfRetries >= this._maxNoOfRetries;
    }

    get shouldThrowErrorOnException(): boolean {
        return this._throwErrorOnException;
    }
}