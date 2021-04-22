import net from "net";
import type {Socket} from "net";
import {Buffer} from "buffer";
import {ModbusClient} from "./modbus-client";

export interface IModbusTcpClientConnectOptions {
    host: string;
    port?: number;
}

export interface IModbusTcpClientBuildOptions extends IModbusTcpClientConnectOptions {

}

export interface IModbusTcpClientConstructionOptions extends IModbusTcpClientBuildOptions {}

export class ModbusTcpClient extends ModbusClient {

    private _socket: Socket;

    private readonly _connectionOptions: IModbusTcpClientConnectOptions = {
        host: '127.0.0.1', port: 502
    }

    constructor(options: IModbusTcpClientConstructionOptions) {
        super();

        this._connectionOptions = options;
    }

    static async build(options: IModbusTcpClientBuildOptions) {
        const modbusTcpClient = new ModbusTcpClient(options);

        modbusTcpClient.createConnection();

        return modbusTcpClient;
    }

    async sendModbusRequest(modbusRequest) {
        return new Promise((resolve, reject) => {
            this._socket.write(modbusRequest.buffer, err => {
                if (err) return reject(err);

                return resolve(true)
            })
        }) as Promise<boolean>
    }

    _onData = (buffer: Buffer) => {
        super.readModbusResponse(buffer)
    }

    protected tryReconnect() {
        if(this._socket) {
            this._reconnectTimeout = setTimeout(() => {
                if(!this._isConnected && !this._socket.connecting) {

                    this._socket.connect({
                        host: this._connectionOptions.host,
                        port: this._connectionOptions.port
                    })
                }
            }, this._reconnectInterval);
        }
    }

    createConnection(): Socket {

        const {host, port = 502} = this._connectionOptions;

        this._socket = net.createConnection({
            host, port
        });

        this._socket.addListener('error', this.onError);
        this._socket.addListener('end', this.onClose);
        this._socket.addListener('close', this.onClose);
        this._socket.addListener('data', this._onData);
        this._socket.addListener('ready', this.onConnected);

        return this._socket;

    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._socket.end(() => {

                this._socket.emit('end');
                this._socket.destroy();

                this._socket = null;

                this.onClose();

                return resolve();
            })
        })
    }

}