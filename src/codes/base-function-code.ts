// import type {Socket} from "net";
// import {isUInt16, isUInt8} from "../utils";
// import {ModbusRequest} from "../modbus-request";
//
// export interface IModbusBaseOptions {
//     unitId?: number;
//     address: number;
//     transactionId: number;
// }
//
//
// export interface IModbusCreateWriteRequest extends IModbusBaseOptions {
//     value: number;
// }
//
// export interface IModbusBuildRequest extends IModbusBaseOptions {
//     functionCode: number;
//     data: number;
// }
//
// export class BuildRequestBufferError extends Error {}
//
// export abstract class BaseFunctionCode {
//
//     static readonly FUNCTION_CODE_NAME: string = '';
//     static readonly FUNCTION_CODE: number = 0x00;
//
//     protected socket: Socket = null;
//
//     protected buildRequest(buildRequestOptions: IModbusBuildRequest): ModbusRequest {
//
//         const {address, data,functionCode,transactionId, unitId} = buildRequestOptions;
//
//         if(!isUInt16(address)) throw new BuildRequestBufferError(`Invalid Address: ${address}`);
//         if(!isUInt16(data)) throw new BuildRequestBufferError(`Invalid Data: ${data}`);
//
//         const message = Buffer.alloc(5);
//
//         message.writeUInt8(functionCode,0);
//         message.writeUInt16BE(address,1);
//         message.writeUInt16BE(data,3);
//
//         return ModbusRequest.build({
//             functionCode,data,unitId,message,address,transactionId
//         })
//     }
//
//     public abstract createRequest(options: IModbusCreateWriteRequest): ModbusRequest;
// }