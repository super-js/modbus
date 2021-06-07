import {IModbusRequestClientOptions, IModbusRequestOptions, ModbusRequest} from "../modbus-request";
import {FUNCTION_CODES} from "../codes";
import {WriteMultipleCoilsResponse} from "./response";

export interface IWriteMultipleCoilsClientOptions extends IModbusRequestClientOptions {
    maxSimultaneousBatches?: number;
}

export interface IWriteMultipleCoilsRequestOptions extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize' > {
}

export class WriteMultipleCoilsRequestError extends Error {}

export class WriteMultipleCoilsRequest extends ModbusRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.WRITE_MULTIPLE_COILS;

    private static REQUEST_BODY_SIZE = 6;

    constructor(options: IWriteMultipleCoilsRequestOptions) {

        const valuesByteSize = Math.ceil(options.data.length / 8);

        if(valuesByteSize > 0xFF) throw new WriteMultipleCoilsRequestError(`Unable to write coils, maximum message length reach - Received ${options.data.length}, maximum allowed is 2040.`)

        const message = Buffer.alloc(WriteMultipleCoilsRequest.REQUEST_BODY_SIZE + valuesByteSize);

        message.writeUInt8(WriteMultipleCoilsRequest.FUNCTION_CODE,0);
        message.writeUInt16BE(options.address,1);
        message.writeUInt16BE(options.data.length, 3)
        message.writeUInt8(valuesByteSize,5);


        let currentByte = 0x00, currentBitNo = 0, currentByteNo = 6;
        for(let i = 0; i < options.data.length; i++) {
            currentByte = ((options.data[i] & 1) << currentBitNo) | currentByte;
            if(currentBitNo == 7 || options.data[i+1] == undefined) {
                message.writeUInt8(currentByte, currentByteNo)
                currentByte = 0x00;
                currentByteNo++;
                currentBitNo = 0;
            } else {
                currentBitNo++;
            }
        }

        super({
            ...options,
            message,
            functionCode: WriteMultipleCoilsRequest.FUNCTION_CODE,
        });

        this.setResponse(new WriteMultipleCoilsResponse({
            functionCode: WriteMultipleCoilsRequest.FUNCTION_CODE,
            modbusRequest: this
        }));
    }
}