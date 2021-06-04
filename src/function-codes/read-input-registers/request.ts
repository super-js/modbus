import {IModbusRequestClientOptions, IModbusRequestOptions} from "../modbus-request";
import {ModbusRequest} from "../modbus-request";
import {FUNCTION_CODES} from "../codes";
import {ReadInputRegistersResponse} from "./response";

export interface IReadInputRegistersClientOptions extends IModbusRequestClientOptions {
}

export interface IReadInputRegistersRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {
}

export class ReadInputRegistersRequestError extends Error {}

export class ReadInputRegistersRequest extends ModbusRequest<ReadInputRegistersResponse> {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_INPUT_REGISTERS;
    private static BODY_SIZE = 5;

    constructor(options: IReadInputRegistersRequestOptions) {

        if(options.data > 0x7D) throw new ReadInputRegistersRequestError(`Unable to read ${options.data} registers. Maximum number of registers allowed is 125`)

        const message = Buffer.alloc(ReadInputRegistersRequest.BODY_SIZE);

        message.writeUInt8(ReadInputRegistersRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: ReadInputRegistersRequest.FUNCTION_CODE
        });

        this.setResponse(new ReadInputRegistersResponse({
            functionCode: ReadInputRegistersRequest.FUNCTION_CODE,
            modbusRequest: this
        }));
    }

}