import {IModbusRequestOptions, ModbusRequest} from "./modbus-request";
import {FUNCTION_CODES} from "../function-codes";

export interface IReadHoldingRegisterRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class ReadHoldingRegisterRequest extends ModbusRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_HOLDING_REGISTERS;
    private static BODY_SIZE = 5;

    private _length: number;
    private _byteLength: number;

    constructor(options: IReadHoldingRegisterRequestOptions) {

        const message = Buffer.alloc(ReadHoldingRegisterRequest.BODY_SIZE);

        message.writeUInt8(ReadHoldingRegisterRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: ReadHoldingRegisterRequest.FUNCTION_CODE,
            expectedResponseBodySize: 2 + (options.data * 2) // Function Code + No of Bytes + Returned data
        });

        this._length = options.data;
        this._byteLength = (options.data * 2);
    }

    static build(options: IReadHoldingRegisterRequestOptions): ReadHoldingRegisterRequest {
        return new ReadHoldingRegisterRequest(options);
    }

    public get result(): number[] {
        let result = [];

        let resultBuffer = Buffer.alloc(this._byteLength, "!");

        this.response.buffer.copy(resultBuffer, 0, this.response.buffer.length - this._byteLength);

        for(let i = 0; i < this._length; i++) {
            result[i] = resultBuffer.readUInt16BE(i * 2)
        }

        return result;
    }
}