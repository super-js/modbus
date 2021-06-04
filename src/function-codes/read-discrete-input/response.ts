import {ModbusResponse} from "../modbus-reponse";

export class ReadDiscreteInputsResponse extends ModbusResponse {
    get startingAddress(): number {
        return this._modbusRequest.startingAddress
    }

    get noOfCoils(): number {
        return this._modbusRequest.data;
    }

    get noOfBytes(): number {
        return this._messageBuffer && this._messageBuffer.length > 1 ? this._messageBuffer.readUIntBE(1, 1) : null;
    }

    get values(): boolean[] {
        let result = [];

        let noOfCoilsRead = 0;
        const valuesBuffer = this._messageBuffer.slice(2);

        for(let i = 0; i < this.noOfBytes; i++) {
            for (let b = 0; b < 8 && noOfCoilsRead < this.noOfCoils; b++) {
                result.push((valuesBuffer[i] & (1 << b)) > 0);
                noOfCoilsRead++;
            }
        }

        return result;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            values: this.values,
            startingAddress: this.startingAddress,
            noOfCoils: this.noOfCoils,
            noOfBytes: this.noOfBytes
        };
    }


}