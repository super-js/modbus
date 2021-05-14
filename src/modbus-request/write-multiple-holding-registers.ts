import {IModbusRequestOptions, ModbusRequest} from "./modbus-request";
import {FUNCTION_CODES} from "../function-codes";

export interface IWriteMultipleHoldingRegistersRequestOptions extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize' > {
}

export class WriteMultipleHoldingRegistersRequest extends ModbusRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.WRITE_MULTIPLE_HOLDING_REGISTERS;

    private static REQUEST_BODY_SIZE = 6;
    private static RESPONSE_BODY_SIZE = 5;

    constructor(options: IWriteMultipleHoldingRegistersRequestOptions) {

        const message = Buffer.alloc(WriteMultipleHoldingRegistersRequest.REQUEST_BODY_SIZE + options.data.length * 2);

        message.writeUInt8(WriteMultipleHoldingRegistersRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data.length, 3)
        message.writeUInt8(options.data.length * 2,5);

        options.data.forEach((value, ix) => {
            message.writeUInt16BE(value, (ix * 2) + 6)
        })

        super({
            ...options,
            message,
            functionCode: WriteMultipleHoldingRegistersRequest.FUNCTION_CODE,
            expectedResponseBodySize: WriteMultipleHoldingRegistersRequest.RESPONSE_BODY_SIZE
        });
    }

    static build(options: IWriteMultipleHoldingRegistersRequestOptions): WriteMultipleHoldingRegistersRequest {
        return new WriteMultipleHoldingRegistersRequest(options);
    }

    public get result(): void {
        return;
    }
}