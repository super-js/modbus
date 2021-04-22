import {IModbusRequestOptions, ModbusRequest} from "./modbus-request";
import {FUNCTION_CODES} from "../function-codes";

export interface IReadCoilsRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class ReadCoilsRequest extends ModbusRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_COILS;
    private static BODY_SIZE = 5

    constructor(options: IReadCoilsRequestOptions) {

        const message = Buffer.alloc(ReadCoilsRequest.BODY_SIZE);

        message.writeUInt8(ReadCoilsRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: ReadCoilsRequest.FUNCTION_CODE,
            expectedResponseBodySize: 2 + Math.ceil(options.data / 8) // Function Code + No of Bytes + Returned data
        });
    }

    static build(options: IReadCoilsRequestOptions): ReadCoilsRequest {
        return new ReadCoilsRequest(options);
    }

    public get result(): boolean[] {
        let result = [];

        return result;
    }
}