import {
    BaseFunctionCode,
    IModbusCreateWriteRequest,
} from "./base-function-code";
import {ModbusRequest} from "../modbus-request";


export interface IWriteHoldingRegisterCreateRequest  extends IModbusCreateWriteRequest {}

export class WriteHoldingRegister extends BaseFunctionCode {

    static readonly FUNCTION_CODE_NAME = 'WRITE_HOLDING_REGISTER';
    static readonly FUNCTION_CODE: number = 0x06;

    static async build(): Promise<WriteHoldingRegister> {
        const writeHoldingRegister = new WriteHoldingRegister();
        return writeHoldingRegister;
    }

    public createRequest(options: IWriteHoldingRegisterCreateRequest): ModbusRequest {

        const {address, value, unitId, transactionId} = options;

        return this.buildRequest({
            unitId, address,
            data: value,
            functionCode: WriteHoldingRegister.FUNCTION_CODE,
            transactionId: transactionId
        });
    }

}