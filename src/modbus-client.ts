// import {MODBUS_FUNCTION_CODES} from "./codes";
// import {BaseFunctionCode} from "./codes/base-function-code";
import {TransactionManager} from "./transaction-manager";
import {
    ModbusRequest,
    WriteHoldingRegisterRequest,
    ReadCoilsRequest,
    ReadHoldingRegisterRequest
} from "./modbus-request";
import {Buffer} from "buffer";
import {ModbusResponse} from "./modbus-reponse";
import {getTransactionIdFromBuffer} from "./utils";

export class ModbusClientNotConnected extends Error {
    constructor() {
        super('Unable to perform the operation, ModbusClient not connected to Slave.');
    }
}

export interface IModbusClientResult<T extends ModbusRequest = any> {
    modbusRequest: T;
}

export abstract class ModbusClient {

    protected _isConnected: boolean = false;
    protected transactionManager: TransactionManager = new TransactionManager();

    protected _reconnectTimeout = null;
    protected _reconnectInterval: number = 5000;

    protected abstract sendModbusRequest(modbusRequest: ModbusRequest): Promise<boolean>;
    protected abstract tryReconnect(): void;

    private _currentResponseBuffer?: Buffer;

    protected onError = (error: Error) => {
        console.warn(`An error occurred in Modbus Client : ${error.message}`);
        if(!this._isConnected) this.tryReconnect();
    }

    protected onConnected = () => {
        this._isConnected = true;
        clearTimeout(this._reconnectTimeout)
    }

    protected onClose = () => {
        this._isConnected = false;
        this.tryReconnect();
    }

    protected async readModbusResponse(buffer: Buffer) {
        if(!this._currentResponseBuffer) this._currentResponseBuffer = buffer;

        const transactionId = getTransactionIdFromBuffer(this._currentResponseBuffer)

        const isTransactionComplete = this.transactionManager.updateTransaction(
            transactionId, this._currentResponseBuffer
        );

        if(isTransactionComplete) {
            this._currentResponseBuffer = null;
        }
    }

    private async execute(modbusRequest: ModbusRequest): Promise<any> {
        if(this._isConnected) {

            this.transactionManager.setTransaction(modbusRequest.transactionId, modbusRequest);

            await Promise.all([
                this.sendModbusRequest(modbusRequest),
                this.transactionManager.waitForTransaction(modbusRequest.transactionId)
            ])

            return modbusRequest.result;

        } else {
            throw new ModbusClientNotConnected();
        }
    }

    get isConnected() {
        return this._isConnected;
    }

    async readCoils(address: number, length: number, unitId?: number): Promise<IModbusClientResult<ReadCoilsRequest>> {
        return this.execute(ReadCoilsRequest.build({
            address,
            data: length,
            unitId,
            transactionId: this.transactionManager.allocateTransaction()
        }))
    }

    async readHoldingRegisters(address: number, length: number, unitId?: number): Promise<number[]> {
        return this.execute(ReadHoldingRegisterRequest.build({
            address,
            data: length,
            unitId,
            transactionId: this.transactionManager.allocateTransaction()
        }));
    }

    async writeHoldingRegister(address: number, value: number, unitId?: number): Promise<IModbusClientResult<WriteHoldingRegisterRequest>> {
        return this.execute(WriteHoldingRegisterRequest.build({
            address,
            data: value,
            unitId,
            transactionId: this.transactionManager.allocateTransaction()
        }))
    }

}