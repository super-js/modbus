import {isUInt8} from "../utils";
import {BuildRequestBufferError} from "../codes/base-function-code";
import {ModbusResponse} from "../modbus-reponse";


export interface IModbusRequestOptions {
    message: Buffer;
    unitId?: number;
    address: number;
    transactionId: number;
    data: number;
    functionCode: number;
}

export type TModbusRequestStatus = 'READY' | 'PROCESSING' | 'COMPLETED';

export class ModbusRequest {

    private static DEFAULT_UNIT_ID = 0x01;

    private _header: Buffer;
    private _message: Buffer;

    private _unitId: number;
    private _address: number;
    private _transactionId: number;
    private _data: number;
    private _functionCode: number;

    private _status: TModbusRequestStatus = 'READY';

    private _response?: ModbusResponse;

    constructor(options: IModbusRequestOptions) {

        this._unitId = options.unitId || ModbusRequest.DEFAULT_UNIT_ID;
        this._address = options.address;
        this._transactionId = options.transactionId;
        this._data = options.data;
        this._message = options.message;
        this._functionCode = options.functionCode;

        if(!isUInt8(this._unitId)) throw new BuildRequestBufferError(`Invalid Unit ID: ${this._unitId}`);

        this._header = Buffer.alloc(7);

        this._header.writeUInt16BE(this._transactionId, 0); // Transaction
        this._header.writeUInt16BE(0x0000, 2); // Modbus protocol
        this._header.writeUInt16BE(this._message.length + 1, 4); // Length of message + unit id
        this._header.writeUInt8(this._unitId, 6); // Unit id

    }

    static build(options: IModbusRequestOptions): ModbusRequest {
        return new ModbusRequest(options);
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

    get response(): ModbusResponse {
        return this._response;
    }

    set response(response: ModbusResponse) {
        this._response = response;
    }

}