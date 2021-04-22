import {IModbusRequestOptions, ModbusRequest} from "./modbus-request";
import {FUNCTION_CODES} from "../function-codes";

export interface IWriteHoldingRegisterRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class WriteHoldingRegisterRequest extends ModbusRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.WRITE_HOLDING_REGISTER;
    private static BODY_SIZE = 5

    constructor(options: IWriteHoldingRegisterRequestOptions) {

        const message = Buffer.alloc(WriteHoldingRegisterRequest.BODY_SIZE);

        message.writeUInt8(WriteHoldingRegisterRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: WriteHoldingRegisterRequest.FUNCTION_CODE,
            expectedResponseBodySize: WriteHoldingRegisterRequest.BODY_SIZE
        });
    }

    static build(options: IWriteHoldingRegisterRequestOptions): WriteHoldingRegisterRequest {
        return new WriteHoldingRegisterRequest(options);
    }

    public get result(): void {
        return;
    }
}