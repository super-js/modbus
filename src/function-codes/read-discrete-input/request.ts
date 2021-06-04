import {IModbusRequestClientOptions, IModbusRequestOptions} from "../modbus-request";
import {FUNCTION_CODES} from "../codes";
import {ModbusRequest} from "../modbus-request";
import {ReadDiscreteInputsResponse} from "./response";

export interface IReadDiscreteInputsClientOptions extends IModbusRequestClientOptions {
}

export interface IReadDiscreteInputsRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class ReadDiscreteInputsRequestError extends Error {}

export class ReadDiscreteInputsRequest extends ModbusRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_DISCRETE_INPUTS;
    private static BODY_SIZE = 5;

    constructor(options: IReadDiscreteInputsRequestOptions) {

        if(options.data > 0x7D0) throw new ReadDiscreteInputsRequestError(`Unable to read ${options.data} registers. Maximum number of registers allowed is 2000`)

        const message = Buffer.alloc(ReadDiscreteInputsRequest.BODY_SIZE);

        message.writeUInt8(ReadDiscreteInputsRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: ReadDiscreteInputsRequest.FUNCTION_CODE
        });

        this.setResponse(new ReadDiscreteInputsResponse({
            functionCode: ReadDiscreteInputsRequest.FUNCTION_CODE,
            modbusRequest: this
        }));
    }

}