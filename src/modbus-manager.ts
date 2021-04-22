import {IModbusTcpClientBuildOptions, ModbusTcpClient} from "./modbus-tcp-client";
import {ModbusClient} from "./modbus-client";

export interface IModbusManagerOptions {

}

export const MODBUS_CLIENT_TYPES = {
    TCP: ModbusTcpClient
}
export type TModbusClientType = keyof typeof MODBUS_CLIENT_TYPES;


export class InvalidModbusClientTypeError extends Error {

}

export class ModbusManager {

    private _modbusClients: {[name: string]: ModbusClient} = {};

    constructor(options: IModbusManagerOptions) {
    }

    addModbusClient = async (connectionName: string, type: TModbusClientType, options: IModbusTcpClientBuildOptions): Promise<ModbusClient> => {

        if(MODBUS_CLIENT_TYPES.hasOwnProperty(type)) {
            const modbusClient = await MODBUS_CLIENT_TYPES[type].build(options);

            this._modbusClients[connectionName] = modbusClient;

            return modbusClient;
        } else {
            throw new InvalidModbusClientTypeError(`Unknown Modbus Client type ${type}`);
        }

    }

    getModbusClient = (connectionName: string): ModbusClient => {
        return this._modbusClients[connectionName];
    }

    removeModbusClient = async (connectionName: string): Promise<void> => {
        const modbusClient = this._modbusClients[connectionName];
        if(modbusClient) {
            await modbusClient.close();
            this._modbusClients[connectionName] = undefined;
        }
    }
}