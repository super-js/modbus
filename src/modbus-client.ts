import {MODBUS_FUNCTION_CODES} from "./codes";
import {BaseFunctionCode} from "./codes/base-function-code";
import {TransactionManager} from "./transaction-manager";
import {ModbusRequest} from "./modbus-request";
import {Buffer} from "buffer";
import {ModbusResponse} from "./modbus-reponse";

export type TFunctionCodes = {[key in keyof typeof MODBUS_FUNCTION_CODES]: BaseFunctionCode};

export class ModbusClientNotConnected extends Error {
    constructor() {
        super('Unable to perform the operation, ModbusClient not connected to Slave.');
    }

}

export abstract class ModbusClient {

    protected _isConnected: boolean = false;
    protected functionCodes: TFunctionCodes = {} as TFunctionCodes;
    protected transactionManager: TransactionManager = new TransactionManager();

    protected constructor() {
        Object.keys(MODBUS_FUNCTION_CODES).forEach(async modbusFunctionCodeName => {
            this.functionCodes[modbusFunctionCodeName] = await MODBUS_FUNCTION_CODES[modbusFunctionCodeName].build()
        })
    }

    protected abstract sendModbusRequest(modbusRequest: ModbusRequest): Promise<boolean>;

    protected async readModbusResponse(buffer: Buffer) {

        const modbusResponse = ModbusResponse.build({
            buffer
        })

        this.transactionManager.resolveTransaction(modbusResponse.transactionId, modbusResponse);
    }

    private async execute(handler: BaseFunctionCode, options: any): Promise<ModbusResponse> {
        if(this._isConnected && handler) {

            const transactionId = this.transactionManager.allocateTransaction();

            const modbusRequest = handler.createRequest({
                ...options,
                transactionId: transactionId
            });

            this.transactionManager.setTransaction(transactionId, modbusRequest);

            await Promise.all([
                this.sendModbusRequest(modbusRequest),
                this.transactionManager.waitForTransaction(transactionId)
            ])

            return modbusRequest.response;

        } else {
            throw new ModbusClientNotConnected();
        }
    }

    async writeHoldingRegister(address: number, value: number, unitId?: number) {
        const handler = this.functionCodes['WRITE_HOLDING_REGISTER'];
        return this.execute(handler, {address, value, unitId})
    }
}