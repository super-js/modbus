import {IModbusRequestClientOptions, IModbusRequestOptions, ModbusRequest} from "../modbus-request";
import {FUNCTION_CODES} from "../codes";
import {WriteHoldingRegisterResponse} from "./response";

export interface IWriteHoldingRegisterClientOptions extends IModbusRequestClientOptions {
}

export interface IWriteHoldingRegisterRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class WriteHoldingRegisterRequest extends ModbusRequest<WriteHoldingRegisterResponse> {

    protected static FUNCTION_CODE = FUNCTION_CODES.WRITE_HOLDING_REGISTER;
    private static BODY_SIZE = 5;

    constructor(options: IWriteHoldingRegisterRequestOptions) {

        const message = Buffer.alloc(WriteHoldingRegisterRequest.BODY_SIZE);

        message.writeUInt8(WriteHoldingRegisterRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: WriteHoldingRegisterRequest.FUNCTION_CODE
        });

        this.setResponse(new WriteHoldingRegisterResponse({
            functionCode: WriteHoldingRegisterRequest.FUNCTION_CODE,
            modbusRequest: this
        }));
    }
}