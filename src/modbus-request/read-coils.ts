import {IModbusRequestOptions} from "./modbus-request";
import {FUNCTION_CODES} from "../function-codes";
import {ModbusReadRequest} from "./modbus-read-request";

export interface IReadCoilsRequestOptions  extends Omit<IModbusRequestOptions, 'message' | 'functionCode' | 'expectedResponseBodySize'> {

}

export class ReadCoilsRequest extends ModbusReadRequest {

    protected static FUNCTION_CODE = FUNCTION_CODES.READ_COILS;

    private readonly _length: number;
    private readonly _byteLength: number;

    constructor(options: IReadCoilsRequestOptions) {

        const readLength = options.data;
        const readByteLength = Math.ceil(options.data / 8);

        super({
            ...options,
            readByteLength, readLength,
            functionCode: ReadCoilsRequest.FUNCTION_CODE,
            expectedResponseBodySize: 2 + readByteLength// (Function Code + No of Bytes) + # of bytes returned
        });

        this._length = options.data;
        this._byteLength = (options.data * 2);
    }

    static build(options: IReadCoilsRequestOptions): ReadCoilsRequest {
        return new ReadCoilsRequest(options);
    }

    public get result(): boolean[] {

        let result = [];
        let noOfCoilsRead = 0;

        for(let i = 0; i < this.readByteLength; i++) {
            for (let b = 0; b < 8 && noOfCoilsRead < this.readLength; b++) {
                result.push((this.resultBuffer[i] & (1 << b)) > 0);
                noOfCoilsRead++;
            }
        }

        return result;
    }
}