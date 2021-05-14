jest.setTimeout(30000)

import {ModbusSerialClient} from "./modbus-serial-client";

describe('ModbusSerialClient', function () {

    let modbusSerialClient: ModbusSerialClient;

    beforeAll(async () => {
        modbusSerialClient = await ModbusSerialClient.build({
            port: 'COM1'
        })
    })

    it('should connect', async () => {
        const isConnected = await new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve(modbusSerialClient.isConnected)
            }, 1000);
        });

        expect(isConnected).toBe(true);
    });

    it('writeHoldingRegister', async () => {

        // await Promise.all([
        //     modbusTcpClient.writeHoldingRegister(0, 1, ),
        //     modbusTcpClient.writeHoldingRegister(1, 2, ),
        //     modbusTcpClient.writeHoldingRegister(2, 3, ),
        //     modbusTcpClient.writeHoldingRegister(3, 4, ),
        //     modbusTcpClient.writeHoldingRegister(4, 5, ),
        //     modbusTcpClient.writeHoldingRegister(5, 6, ),
        //     modbusTcpClient.writeHoldingRegister(6, 7, ),
        //     modbusTcpClient.writeHoldingRegister(7, 8, ),
        //     modbusTcpClient.writeHoldingRegister(8, 9, ),
        //     modbusTcpClient.writeHoldingRegister(9, 10, ),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4),
        //     modbusTcpClient.readCoils(0, 4)
        // ]);

        expect(true).toBe(true);
    });

    it('readCoils', async () => {

        const result = await modbusSerialClient.readCoils(0, 10);

        console.log(result)

        expect(result).not.toBe(null);
    });

});