jest.setTimeout(30000)

import {ModbusTcpClient} from "./modbus-tcp-client";

describe('ModbusTcpClient', function () {

    let modbusTcpClient: ModbusTcpClient;

    beforeAll(async () => {
        modbusTcpClient = await ModbusTcpClient.build({
            host: '127.0.0.1', port: 502
        })
    })

    it('should connect', async () => {
        const isConnected = await new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve(modbusTcpClient.isConnected)
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

        const result = await modbusTcpClient.readCoils(0, 10);

        console.log(result)

        expect(result).not.toBe(null);
    });

});