import net from "net";
import type {Socket} from "net";
import {Buffer} from "buffer";
import {ModbusClient} from "./modbus-client";

export interface IModbusTcpClientConnectOptions {
    host: string;
    port?: number;
    timeout?: number;
}

export interface IModbusTcpClientBuildOptions extends IModbusTcpClientConnectOptions {
    waitForConnection?: boolean;
    waitForConnectionTimeout?: number;
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
        const {waitForConnection = false, waitForConnectionTimeout = 30, ...rest} = options;

        const modbusTcpClient = new ModbusTcpClient(rest);

        modbusTcpClient.createConnection();

        if(waitForConnection) await modbusTcpClient.waitForConnection(waitForConnectionTimeout);

        return modbusTcpClient;
    }

    protected createConnection(): void {

        const {host, port = 502, timeout = 30} = this._connectionOptions;

        this._socket = net.createConnection({
            host, port, timeout: timeout * 1000
        });

        this._socket.addListener('error', this.onError);
        this._socket.addListener('end', this.onClose);
        this._socket.addListener('close', this.onClose);
        this._socket.addListener('timeout', this.onClose);
        this._socket.addListener('data', this._onData);
        this._socket.addListener('ready', this.onConnected);

    }

    async sendModbusRequest(modbusRequest) {
        return new Promise((resolve, reject) => {
            this._socket.write(modbusRequest.buffer, err => {
                if (err) return reject(err);
                return resolve(true)
            });
        }) as Promise<boolean>
    }

    _onData = (buffer: Buffer) => {
        super.onDataReceived(buffer)
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

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {

            const _destroy = () => {
                this._socket.destroy();
                this._socket = null;
                this.onClose(true);
                return resolve();
            }

            if(this.isConnected) {
                this._socket.end(() => {
                    this._socket.emit('end');
                    _destroy();
                })
            } else {
                if(this._socket) _destroy();
                return resolve();
            }


        })
    }

}