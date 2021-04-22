import crypto from "crypto";
import {ModbusRequest} from "./modbus-request";
import {ModbusResponse} from "./modbus-reponse";

export class TransactionManager {

    private _transactions: Map<number, ModbusRequest> = new Map();

    constructor() {}

    private generateTransactionId(): number {
        const transactionId = crypto.randomBytes(2).readUInt16BE(0);

        if(this._transactions.has(transactionId)) return this.generateTransactionId();

        return transactionId;
    }


    allocateTransaction(): number {
        const transactionId = this.generateTransactionId();

        this._transactions.set(transactionId, {} as ModbusRequest);

        return transactionId;
    }

    setTransaction(transactionId: number, modbusRequest: ModbusRequest) {
        this._transactions.set(transactionId, modbusRequest);
    }

    waitForTransaction(transactionId: number) {
        return new Promise((resolve, reject) => {

            const checkTransactionStatus = () => {
                const transaction = this._transactions.get(transactionId);

                if(!transaction || transaction.response) {
                    this._transactions.delete(transactionId);
                    return resolve(true)
                };

                setTimeout(checkTransactionStatus, 500);
            }

            checkTransactionStatus();

        })
    }

    resolveTransaction(transactionId: number, modbusResponse: ModbusResponse): boolean {
        const modbusRequest = this._transactions.get(transactionId);

        if(modbusRequest) {
            modbusRequest.response = modbusResponse;
            return true;
        }

        return false;
    }



}