import {ModbusResponse} from "../modbus-reponse";

export class WriteHoldingRegisterResponse extends ModbusResponse {
    get address(): number {
        return this._messageBuffer && this._messageBuffer.length > 2 ? this._messageBuffer.readUIntBE(1, 2) : null
    }

    get value(): number {
        return this._messageBuffer && this._messageBuffer.length > 4 ? this._messageBuffer.readUIntBE(3, 2) : null
    }

    toJSON() {
        return {
            ...super.toJSON(),
            address: this.address,
            value: this.value
        };
    }
}