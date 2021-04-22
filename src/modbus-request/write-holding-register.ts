import {IModbusRequestOptions, ModbusRequest} from "./index";

export class WriteHoldingRegisterRequest extends ModbusRequest {

    static build(options: IModbusRequestOptions): ModbusRequest {
        return new ModbusRequest(options);
    }
}