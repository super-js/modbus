import {ModbusRequest} from "./modbus-request";

export interface IModbusResponseOptions {
    functionCode: number;
    modbusRequest: ModbusRequest;
}

export abstract class ModbusResponse {

    public static MODBUS_RESPONSE_HEADER_SIZE = 7;

    protected _headerBuffer: Buffer;
    protected _messageBuffer: Buffer;

    protected readonly _requestFunctionCode: number;
    protected readonly _modbusRequest: ModbusRequest;

    private _exceptionCode: number;

    constructor(options: IModbusResponseOptions) {
        this._requestFunctionCode = options.functionCode;
        this._modbusRequest = options.modbusRequest;
    }

    updateBuffer(buffer: Buffer): Buffer {

        let remainingBuffer = Buffer.from(buffer);

        if(!this._headerBuffer) {
            const headerByteCount = Math.min(ModbusResponse.MODBUS_RESPONSE_HEADER_SIZE, buffer.length);
            this._headerBuffer = remainingBuffer.slice(0, headerByteCount);
            remainingBuffer = remainingBuffer.slice(headerByteCount);
        }

        if(this.messageLength && remainingBuffer.length > 0) {
            const bodyByteCount = Math.min(this.messageLength, remainingBuffer.length);
            this._messageBuffer = remainingBuffer.slice(0, bodyByteCount);

            // Check for exception
            if(this._messageBuffer.readUIntBE(0, 1) !== this._requestFunctionCode
            && this._messageBuffer.length > 1) {
                this._exceptionCode = this._messageBuffer.readUIntBE(1, 1);
            }

            remainingBuffer = remainingBuffer.slice(bodyByteCount);
        }

        return remainingBuffer;

    }

    get isHeaderBufferComplete(): boolean {
        return this._headerBuffer && this._headerBuffer.length === ModbusResponse.MODBUS_RESPONSE_HEADER_SIZE
    }

    get isBodyBufferComplete(): boolean {
        return this._messageBuffer && this.messageLength && this._messageBuffer.length === this.messageLength
    }

    get buffer(): Buffer {

        const headerBuffer = this._headerBuffer ? this._headerBuffer : Buffer.alloc(0);
        const bodyBuffer = this._messageBuffer ? this._messageBuffer : Buffer.alloc(0);

        return Buffer.concat([
            headerBuffer,
            bodyBuffer
        ], headerBuffer.length + bodyBuffer.length);
    }

    get isComplete(): boolean {
        return this.isHeaderBufferComplete && this.isBodyBufferComplete
    }

    get transactionId(): number {
        return this._headerBuffer && this._headerBuffer.length >= 2 ? this._headerBuffer.readUInt16BE(0) : null;
    }

    get protocol(): number {
        return this._headerBuffer && this._headerBuffer.length >= 4 ? this._headerBuffer.readUIntBE(2, 2) : null;
    }

    get messageLength(): number {
        return this._headerBuffer && this._headerBuffer.length >= 6 ? this._headerBuffer.readUIntBE(4, 2) - 1 : null;
    }

    get unitId(): number {
        return this._headerBuffer && this._headerBuffer.length > 0 ? this._headerBuffer.readUIntBE(6, 1) : null;
    }
    
    get functionCode(): number {
        return this._messageBuffer && this._messageBuffer.length > 0 ? this._messageBuffer.readUIntBE(0, 1) : null;
    }

    get exceptionCode(): number {
        return this._exceptionCode || null;
    }

    get exceptionName(): string {
        if(!this.exceptionCode) return null;

        switch (this.exceptionCode) {
            case 0x01:
                return `ILLEGAL FUNCTION : ${this.functionCode - 0x80}`;
            case 0x02:
                return `ILLEGAL DATA ADDRESS : ${this._modbusRequest.startingAddress} => ${this._modbusRequest.messageLength}`;
            case 0x03:
                return `ILLEGAL DATA VALUE : ${this._modbusRequest.data}`;
            case 0x04:
                return "SLAVE DEVICE FAILURE";
            case 0x05:
                return "ILLEGAL FUNCTION";
            case 0x06:
                return "SLAVE DEVICE BUSY";
            case 0x08:
                return "MEMORY PARITY ERROR";
            case 0x0A:
                return "GATEWAY PATH UNAVAILABLE";
            case 0x0B:
                return "GATEWAY TARGET DEVICE FAILED TO RESPOND";
           default:
                return "UNKNOWN"
        }
    }

    get hasError(): boolean {
        return !!this.exceptionCode;
    }

    get request(): ModbusRequest {
        return this._modbusRequest;
    }

    toJSON() {
        return {
            transactionId: this.transactionId,
            protocol: this.protocol,
            messageLength: this.messageLength,
            unitId: this.unitId,
            functionCode: this.functionCode,
            hasError: this.hasError,
            exceptionCode: this.exceptionCode,
            exceptionName: this.exceptionName,
            noOfRetries: this._modbusRequest.noOfRetries,
            failedTransactionIds: this._modbusRequest.failedTransactionIds
        }
    }
}