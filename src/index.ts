export * from "./modbus-tcp-client";

// import {ModbusTcpClient} from "./tcp-client";
//
// (async () => {
//     try {
//         const modbusTcpClient = await ModbusTcpClient.build({
//             host: '127.0.0.1',
//             port: 502
//         });
//
//         setTimeout(async () => {
//             const [res1, res2] = await Promise.all([
//                 modbusTcpClient.writeHoldingRegister(5, 2),
//                 modbusTcpClient.writeHoldingRegister(0, 10)
//             ]);
//
//             console.log(res1.transactionId, res2)
//         }, 2000)
//
//         // await modbusTcpClient.connect({
//         //     host: '127.0.0.1'
//         // });
//
//         //await modbusTcpClient.close();
//         //
//         // console.log('exit')
//         //
//          //process.exit(0);
//     } catch(err) {
//         console.error(err);
//         process.exit(-1);
//     }
// })();