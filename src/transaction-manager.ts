import crypto from "crypto";
import {ModbusRequest} from "./modbus-request";

export class TransactionTimeoutError extends Error {}

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

    updateTransaction(transactionId: number, responseBuffer: Buffer): boolean {
        const modbusRequest = this._transactions.get(transactionId);

        if(modbusRequest) {
            modbusRequest.updateResponseBuffer(responseBuffer);
            return modbusRequest.isComplete;
        }

        return false;
    }

    waitForTransaction(transactionId: number, timeout: number = 5000) {

        let maxNoOfRetries = timeout / 500;
        let noOfRetries = 0;

        return new Promise((resolve, reject) => {

            const checkTransactionStatus = () => {
                const modbusRequest = this._transactions.get(transactionId);

                if(!modbusRequest || modbusRequest.isComplete) {
                    this._transactions.delete(transactionId);
                    return resolve(true)
                }

                noOfRetries++;

                if(noOfRetries >= maxNoOfRetries) return reject(new TransactionTimeoutError(`Transaction ID ${transactionId} timed out.`))

                setTimeout(checkTransactionStatus, 500);
            }

            checkTransactionStatus();

        })
    }

}