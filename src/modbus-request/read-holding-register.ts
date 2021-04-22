import {IModbusRequestOptions} from "./modbus-request";
import {ModbusReadRequest} from "./modbus-read-request";
import {FUNCTION_CODES} from "../function-codes";

export interface IReadHoldingRegisterRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class ReadHoldingRegisterRequest extends ModbusReadRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_HOLDING_REGISTERS;

    constructor(options: IReadHoldingRegisterRequestOptions) {

        const readLength = options.data;
        const readByteLength = (options.data * 2);

        super({
            ...options,
            readLength, readByteLength,
            functionCode: ReadHoldingRegisterRequest.FUNCTION_CODE,
            expectedResponseBodySize: 2 + readByteLength // Function Code + No of Bytes + Returned data
        });
    }

    static build(options: IReadHoldingRegisterRequestOptions): ReadHoldingRegisterRequest {
        return new ReadHoldingRegisterRequest(options);
    }

    public get result(): number[] {
        let result = [];

        for(let i = 0; i < this.readLength; i++) {
            result[i] = this.resultBuffer.readUInt16BE(i * 2)
        }

        return result;
    }
}