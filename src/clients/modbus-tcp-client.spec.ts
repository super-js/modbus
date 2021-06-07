jest.setTimeout(30000)

import {ModbusTcpClient} from "./modbus-tcp-client";

describe('ModbusTcpClient', function () {

    let modbusTcpClient: ModbusTcpClient;

    const getModbusTcpClient = () => ModbusTcpClient.build({
        waitForConnection: true, waitForConnectionTimeout: 30,
        host: '127.0.0.1', port: 502
    });

    it('should wait for connection', async () => {
        const modbusClient = await ModbusTcpClient.build({
            waitForConnection: true, waitForConnectionTimeout: 30,
            host: '127.0.0.1', port: 502
        });

        expect(modbusClient.isConnected).toBeTruthy();
    });

    it('should fail to connect', async () => {
        expect(async () => {
            await ModbusTcpClient.build({
                waitForConnection: true, waitForConnectionTimeout: 30,
                host: '227.0.21.1', port: 502
            });
        }).toThrowError();
    });

    it('writeMultipleHoldingRegisters', async () => {

        const client = await getModbusTcpClient();

        const results = await client.writeMultipleHoldingRegisters(
            0,
            new Array(100).fill(11),
            {maxSimultaneousBatches: 100}
        );

        expect(results.length).toBe(1)

    });

    it('writeCoils', async () => {

        const client = await getModbusTcpClient();

        const result = await client.writeMultipleCoils(
            0,
            new Array(2040).fill(true)
        );

        console.log(result.toJSON())

        expect(result.startingAddress === 0 && result.quantity === 2000).toBeTruthy()

    });

    it('writeHoldingRegister', async () => {

        const client = await getModbusTcpClient();

        const result = await client.writeHoldingRegister(
            100,
            55
        );

        console.log(result.toJSON())

        expect(result.address === 100 && result.value === 55).toBeTruthy()

    });

    it('readHoldingRegisters', async () => {

        const client = await getModbusTcpClient();

        const result = await client.readHoldingRegisters(
            100,
            55
        );
        expect(result.values.length === 55).toBeTruthy();

    });

    it('readInputRegisters', async () => {

        const client = await getModbusTcpClient();

        const result = await client.readInputRegisters(
            100,
            55
        );

        expect(result.values.length === 55).toBeTruthy();

    });

    it('readCoils', async () => {

        const client = await getModbusTcpClient();

        const result = await client.readCoils(
            0,
            10
        );

        expect(result.values.length === 10).toBeTruthy()

    });

    it('readDiscreteInputs', async () => {

        const client = await getModbusTcpClient();

        const result = await client.readDiscreteInputs(
            0,
            10
        );

        console.log(result.toJSON())

        expect(result.values.length === 10).toBeTruthy()

    });

});