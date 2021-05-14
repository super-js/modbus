import {ModbusTcpClient} from "./modbus-tcp-client";
import {ModbusManager} from "./modbus-manager";

describe('ModbusManager', function () {

    const modbusManager = new ModbusManager<{
        testConnection1: ModbusTcpClient;
        testConnection2: ModbusTcpClient;
    }>();

    it('should add modbus clients', async () => {
        const [_client1, _client2] = await Promise.all([
            modbusManager.addModbusClient('testConnection1', 'TCP', {
                host: '127.0.0.1', port: 502
            }),
            modbusManager.addModbusClient('testConnection2', 'TCP', {
                host: '127.0.0.1', port: 502
            })
        ]);

        expect(_client1).toBeInstanceOf(ModbusTcpClient);
        expect(_client2).toBeInstanceOf(ModbusTcpClient);
    });

    it('should get modbus clients', async () => {
        const [_client1, _client2] = await Promise.all([
            modbusManager.getModbusClient('testConnection1'),
            modbusManager.getModbusClient('testConnection2')
        ]);

        expect(_client1).toBeInstanceOf(ModbusTcpClient);
        expect(_client2).toBeInstanceOf(ModbusTcpClient);
    });

    it('should remove modbus clients', async () => {
        const _client1= await modbusManager.removeModbusClient('testConnection1')
        expect(_client1).toBe(true);
    });

    it('should fail remove modbus clients', async () => {
        const _client1 = await modbusManager.removeModbusClient('testConnection1')

        expect(_client1).toBe(false);
    });


});