import {IModbusRequestClientOptions, IModbusRequestOptions} from "../modbus-request";
import {ModbusRequest} from "../modbus-request";
import {FUNCTION_CODES} from "../codes";
import {ReadHoldingRegistersResponse} from "./response";

export interface IReadHoldingRegistersClientOptions extends IModbusRequestClientOptions {
}

export interface IReadHoldingRegistersRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {
}

export class ReadHoldingRegistersRequestError extends Error {}

export class ReadHoldingRegistersRequest extends ModbusRequest<ReadHoldingRegistersResponse> {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_HOLDING_REGISTERS;
    private static BODY_SIZE = 5;

    constructor(options: IReadHoldingRegistersRequestOptions) {

        if(options.data > 0x7D) throw new ReadHoldingRegistersRequestError(`Unable to read ${options.data} registers. Maximum number of registers allowed is 125`)

        const message = Buffer.alloc(ReadHoldingRegistersRequest.BODY_SIZE);

        message.writeUInt8(ReadHoldingRegistersRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data,3);

        super({
            ...options,
            message,
            functionCode: ReadHoldingRegistersRequest.FUNCTION_CODE
        });

        this.setResponse(new ReadHoldingRegistersResponse({
            functionCode: ReadHoldingRegistersRequest.FUNCTION_CODE,
            modbusRequest: this
        }));
    }
}