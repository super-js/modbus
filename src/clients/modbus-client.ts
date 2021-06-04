import {TransactionManager} from "../transaction-manager";
import {
    ModbusRequest,
    WriteHoldingRegisterRequest,
    ReadCoilsRequest,
    ReadHoldingRegistersRequest,
    WriteMultipleHoldingRegistersRequest,
    WriteMultipleHoldingRegistersResponse,
    ModbusResponse,
    WriteHoldingRegisterResponse,
    ReadHoldingRegistersResponse,
    ReadCoilsResponse,
    IWriteMultipleHoldingRegistersClientOptions,
    IWriteHoldingRegisterClientOptions,
    IReadHoldingRegistersClientOptions,
    IModbusRequestClientOptions,
    IReadCoilsClientOptions,
    IReadInputRegistersClientOptions,
    ReadInputRegistersResponse,
    ReadInputRegistersRequest
} from "../function-codes";

import * as config from "../config";
import {
    IReadDiscreteInputsClientOptions,
    ReadDiscreteInputsRequest,
    ReadDiscreteInputsResponse
} from "../function-codes/read-discrete-input";

export interface IGetUnitIdAndOptions<T = IModbusRequestClientOptions> {
    unitId: number;
    _options: T;
}

export class ModbusClientNotConnected extends Error {
    constructor() {
        super('Unable to perform the operation, ModbusClient not connected to Slave.');
    }
}

export abstract class ModbusClient {

    protected _isConnected: boolean = false;
    protected transactionManager: TransactionManager = new TransactionManager();

    protected _reconnectTimeout = null;
    protected _reconnectInterval: number = 5000;

    private _responseBuffer: Buffer = Buffer.alloc(0);

    protected abstract sendModbusRequest(modbusRequest: ModbusRequest): Promise<boolean>;
    protected abstract tryReconnect(): void;
    protected abstract createConnection(): void;

    abstract close(): Promise<void>;

    static getUnitIdAndOptions<T = IModbusRequestClientOptions>(input: number | IModbusRequestClientOptions): IGetUnitIdAndOptions<T> {
        const unitId = Number.isInteger(input) ? input as number : null;
        const _options = (!Number.isInteger(input) ? input || {} : {}) as T;

        return {
            unitId,
            _options
        }
    }

    private processResponseBuffer() {
        this._responseBuffer = this.transactionManager.tryUpdateTransaction(this._responseBuffer);
        if(this._responseBuffer.length > 0) return this.processResponseBuffer()
    }

    protected onError = (error: Error) => {
        console.warn(`An error occurred in Modbus Client : ${error.message}`);
        if(!this._isConnected) this.tryReconnect();
    }

    protected onConnected = () => {
        this._isConnected = true;
        clearTimeout(this._reconnectTimeout)
    }

    protected onClose = (skipReconnect?: boolean) => {
        this._isConnected = false;
        if(!skipReconnect) this.tryReconnect();
    }

    protected async onDataReceived(buffer: Buffer) {
        this._responseBuffer = Buffer.concat([
            this._responseBuffer, buffer
        ]);

        this.processResponseBuffer()
    }

    private async execute<R extends ModbusResponse = ModbusResponse>(modbusRequest: ModbusRequest): Promise<R> {
        if(this._isConnected) {


            this.transactionManager.setTransaction(modbusRequest.transactionId, modbusRequest);

            if(!modbusRequest.response.isHeaderBufferComplete) {
                await this.sendModbusRequest(modbusRequest);
            }

            const isCompleted = await this.transactionManager.waitForTransaction(modbusRequest.transactionId);
            if(!isCompleted) return this.execute(modbusRequest);

            return modbusRequest.response as R;

        } else {
            throw new ModbusClientNotConnected();
        }
    }

    get isConnected() {
        return this._isConnected;
    }

    public waitForConnection(timeout: number = 30): Promise<void> {
        return new Promise((resolve, reject) => {

            let noOfRetries = 0;

            const checkConnection = () => {

                noOfRetries++;

                if(this.isConnected) return resolve();

                if((timeout * 1000) <= noOfRetries * 500) return reject(new Error('Modbus Client connection failed'))

                setTimeout(() => checkConnection(), 500);
            }

            return checkConnection();
        })
    }

    async readCoils(address: number, length: number, options?: number | IReadCoilsClientOptions): Promise<ReadCoilsResponse> {

        const {unitId, _options} = ModbusClient.getUnitIdAndOptions(options);

        return this.execute<ReadCoilsResponse>(new ReadCoilsRequest({
            address,
            data: length,
            unitId : unitId || _options.unitId,
            transactionId: this.transactionManager.allocateTransaction(),
            ..._options
        }))
    }

    async readDiscreteInputs(address: number, length: number, options?: number | IReadDiscreteInputsClientOptions): Promise<ReadDiscreteInputsResponse> {

        const {unitId, _options} = ModbusClient.getUnitIdAndOptions(options);

        return this.execute<ReadDiscreteInputsResponse>(new ReadDiscreteInputsRequest({
            address,
            data: length,
            unitId : unitId || _options.unitId,
            transactionId: this.transactionManager.allocateTransaction(),
            ..._options
        }))
    }

    async readHoldingRegisters(address: number, length: number, options?: number | IReadHoldingRegistersClientOptions): Promise<ReadHoldingRegistersResponse> {

        const {unitId, _options} = ModbusClient.getUnitIdAndOptions(options);

        return this.execute<ReadHoldingRegistersResponse>(new ReadHoldingRegistersRequest({
            address,
            data: length,
            unitId : unitId || _options.unitId,
            transactionId: this.transactionManager.allocateTransaction(),
            ..._options
        }));
    }

    async readInputRegisters(address: number, length: number, options?: number | IReadInputRegistersClientOptions): Promise<ReadInputRegistersResponse> {

        const {unitId, _options} = ModbusClient.getUnitIdAndOptions(options);

        return this.execute<ReadInputRegistersResponse>(new ReadInputRegistersRequest({
            address,
            data: length,
            unitId : unitId || _options.unitId,
            transactionId: this.transactionManager.allocateTransaction(),
            ..._options
        }));
    }

    async writeHoldingRegister(address: number, value: number, options?: number | IWriteHoldingRegisterClientOptions): Promise<WriteHoldingRegisterResponse> {

        const {unitId, _options} = ModbusClient.getUnitIdAndOptions(options);

        return this.execute<WriteHoldingRegisterResponse>(new WriteHoldingRegisterRequest({
            address,
            data: value,
            unitId: unitId || _options.unitId,
            transactionId: this.transactionManager.allocateTransaction(),
            ..._options
        }));
    }

    async writeMultipleHoldingRegisters(address: number, values: number[], options?: number | IWriteMultipleHoldingRegistersClientOptions): Promise<WriteMultipleHoldingRegistersResponse[]> {

        let results = [];

        const {unitId, _options} = ModbusClient.getUnitIdAndOptions<IWriteMultipleHoldingRegistersClientOptions>(options);

        const maxSimultaneousBatches = _options.maxSimultaneousBatches || 7;
        const _values = [...values];

        let batchAddress = address, batchGroups = new Map();
        while(_values.length > 0) {

            batchGroups.set(batchAddress, _values.splice(0, Math.min(config.MAX_CONTIGUOUS_REGISTERS, _values.length)));
            batchAddress = batchAddress + config.MAX_CONTIGUOUS_REGISTERS;

            if(batchGroups.size >= maxSimultaneousBatches || _values.length === 0) {

                const batchGroupResults = await Promise.all(Array.from(batchGroups.entries()).map(([startingAddress, data]) => {

                    const transactionId = this.transactionManager.allocateTransaction();

                    return this.execute<WriteMultipleHoldingRegistersResponse>(new WriteMultipleHoldingRegistersRequest({
                        address : startingAddress, data,
                        unitId: unitId || _options.unitId,
                        transactionId: transactionId,
                        ..._options
                    }));
                }));

                results.push(...batchGroupResults);

                batchGroups.clear();
            }
        }

        return results;

    }


}