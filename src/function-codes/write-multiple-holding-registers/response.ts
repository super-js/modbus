import { ModbusResponse} from "../modbus-reponse";
import {WriteMultipleHoldingRegistersRequest} from "./request";

export class WriteMultipleHoldingRegistersResponse extends ModbusResponse {
    get startingAddress(): number {
        return this._messageBuffer && this._messageBuffer.length > 2 ? this._messageBuffer.readUIntBE(1, 2) : null
    }

    get quantity(): number {
        return this._messageBuffer && this._messageBuffer.length > 4 ? this._messageBuffer.readUIntBE(3, 2) : null
    }

    toJSON() {
        return {
            ...super.toJSON(),
            startingAddress: this.startingAddress,
            quantity: this.quantity
        };
    }
}