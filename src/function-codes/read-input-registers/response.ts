import {IModbusResponseOptions, ModbusResponse} from "../modbus-reponse";

export class ReadInputRegistersResponse extends ModbusResponse {

    get startingAddress(): number {
        return this._modbusRequest.startingAddress
    }

    get noOfRegisters(): number {
        return this._messageBuffer && this._messageBuffer.length > 1 ? this._messageBuffer.readUIntBE(1, 1) / 2 : null;
    }

    get noOfBytes(): number {
        return this.noOfRegisters ? this.noOfRegisters * 2 : null;
    }

    get values(): number[] {
        if(!this.noOfBytes) return null;

        let values = [];
        const valuesBuffer = this._messageBuffer.slice(2);

        for(let i = 0; (i*2) < this.noOfBytes; i++) {
            values[i] = valuesBuffer.readInt16BE(i*2);
        }

        return values;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            values: this.values,
            startingAddress: this.startingAddress
        };
    }

}