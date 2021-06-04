import {IModbusRequestClientOptions, IModbusRequestOptions} from "../modbus-request";
import {FUNCTION_CODES} from "../codes";
import {ModbusRequest} from "../modbus-request";
import {ReadCoilsResponse} from "./response";

export interface IReadCoilsClientOptions extends IModbusRequestClientOptions {
}

export interface IReadCoilsRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class ReadCoilsRequestError extends Error {}

export class ReadCoilsRequest extends ModbusRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_COILS;
    private static BODY_SIZE = 5;

    constructor(options: IReadCoilsRequestOptions) {

        if(options.data > 0x7D0) throw new ReadCoilsRequestError(`Unable to read ${options.data} registers. Maximum number of registers allowed is 2000`)

        const message = Buffer.alloc(ReadCoilsRequest.BODY_SIZE);

        message.writeUInt8(ReadCoilsRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: ReadCoilsRequest.FUNCTION_CODE
        });

        this.setResponse(new ReadCoilsResponse({
            functionCode: ReadCoilsRequest.FUNCTION_CODE,
            modbusRequest: this
        }));
    }
}