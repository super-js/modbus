import {IModbusTcpClientBuildOptions, ModbusTcpClient, ModbusClient} from "./clients";

export interface IModbusManagerOptions {

}

export const MODBUS_CLIENT_TYPES = {
    TCP: ModbusTcpClient
}
export type TModbusClientType = keyof typeof MODBUS_CLIENT_TYPES;


export class InvalidModbusClientTypeError extends Error {

}

export interface IModbusManager {
    [connectionName: string]: ModbusClient
}

export class ModbusManager<T extends IModbusManager = IModbusManager> {

    private _modbusClients: T = {} as T;

    constructor(options?: IModbusManagerOptions) {
    }

    addModbusClient = async (connectionName: keyof T, type: TModbusClientType, options: IModbusTcpClientBuildOptions): Promise<ModbusClient> => {

        if(MODBUS_CLIENT_TYPES.hasOwnProperty(type)) {
            const modbusClient = await MODBUS_CLIENT_TYPES[type].build(options);

            this._modbusClients[connectionName] = modbusClient as any;

            return modbusClient;
        } else {
            throw new InvalidModbusClientTypeError(`Unknown Modbus Client type ${type}`);
        }

    }

    getModbusClient = (connectionName: keyof T): ModbusClient => {
        return this._modbusClients[connectionName];
    }

    removeModbusClient = async (connectionName: keyof T): Promise<boolean> => {
        const modbusClient = this._modbusClients[connectionName];
        if(modbusClient) {
            await modbusClient.close();
            this._modbusClients[connectionName] = undefined;

            return true;
        }

        return false;
    }
}