import {ModbusClient} from "./modbus-client";
import SerialPort from "serialport";

export interface IModbusSerialClientOptions {
    port: string;
}

export interface IModbusSerialClientBuildOptions extends IModbusSerialClientOptions {
    waitForConnection?: boolean;
    waitForConnectionTimeout?: number;
}

export class ModbusSerialClient extends ModbusClient {

    private _portConnection: SerialPort;
    private readonly _portName: string;

    constructor(options: IModbusSerialClientOptions) {
        super();

        this._portName = options.port;
    }

    static async build(options: IModbusSerialClientBuildOptions) {

        const {waitForConnection = false, waitForConnectionTimeout = 30, ...rest} = options;

        const modbusSerialClient = new ModbusSerialClient(rest);
        modbusSerialClient.createConnection();

        if(waitForConnection) await modbusSerialClient.waitForConnection(waitForConnectionTimeout);

        return modbusSerialClient;
    }

    protected createConnection(): void {
        this._portConnection = new SerialPort(this._portName, err => {
            if(err) super.onError(err);
        });

        this._portConnection.on('open', this.onConnected);
        this._portConnection.on('data', super.onDataReceived);
    }

    async sendModbusRequest(modbusRequest) {
        return new Promise((resolve, reject) => {
            this._portConnection.write(modbusRequest.buffer, err => {
                if (err) return reject(err);
                return resolve(true)
            })
        }) as Promise<boolean>
    }

    protected tryReconnect() {
        if(this._portConnection) {
            this._reconnectTimeout = setTimeout(() => {
                if(!this._isConnected && !this._portConnection.isOpen) {
                    this._portConnection.open()
                }
            }, this._reconnectInterval);
        }
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._portConnection.emit('end');
            this._portConnection.close((err) => {
                this._portConnection.destroy();
                this._portConnection = null;
                this.onClose(true);
                return resolve();
            })
        })
    }

}