import crypto from "crypto";
import {ModbusRequest} from "./function-codes";

export class TransactionTimeoutError extends Error {}

export interface IUpdateTransactionResult {
    isComplete: boolean;
    restOfBuffer: Buffer;
}

export class TransactionManager {

    private _transactions: Map<number, ModbusRequest> = new Map();
    private _currentTransactionResponse?: ModbusRequest = null;

    constructor() {}

    static getTransactionIdFromBuffer(buffer: Buffer): number {
        return buffer.length > 2 ? buffer.readUIntBE(0, 2) : null;
    }

    private generateTransactionId(): number {
        const transactionId = crypto.randomBytes(2).readUInt16BE(0);

        if(this._transactions.has(transactionId)) return this.generateTransactionId();

        return transactionId;
    }

    doesTransactionExist(transactionId: number): boolean {
        return this._transactions.has(transactionId);
    }

    allocateTransaction(): number {
        const transactionId = this.generateTransactionId();

        this._transactions.set(transactionId, {} as ModbusRequest);

        return transactionId;
    }

    setTransaction(transactionId: number, modbusRequest: ModbusRequest) {
        this._transactions.set(transactionId, modbusRequest);
    }

    tryUpdateTransaction(responseBuffer: Buffer): Buffer {
        if(this._currentTransactionResponse) {
            const restOfResponseBuffer = this._currentTransactionResponse.updateResponseBuffer(responseBuffer);

            if(restOfResponseBuffer.length === 0) this._currentTransactionResponse = null;

            return restOfResponseBuffer;

        } else {
            const transactionId = TransactionManager.getTransactionIdFromBuffer(responseBuffer);
            const transaction = this._transactions.get(transactionId);

            // Invalid response buffer so clear the response buffer
            if(!transaction) return Buffer.alloc(0)

            return transaction.updateResponseBuffer(responseBuffer);
        }
    }

    waitForTransaction(transactionId: number, timeout: number = 5000) {

        let maxNoOfRetries = timeout / 500;
        let noOfRetries = 0;

        return new Promise((resolve, reject) => {

            const checkTransactionStatus = () => {
                const modbusRequest = this._transactions.get(transactionId);

                if(!modbusRequest || modbusRequest.isComplete) {
                    this._transactions.delete(transactionId);

                    if(modbusRequest.shouldThrowErrorOnException && modbusRequest.response.hasError) {
                        throw new Error(`Transaction ID ${transactionId} failed - ${modbusRequest.response.exceptionName}`)
                    } else {
                        return resolve(true)
                    }
                }

                noOfRetries++;

                if(noOfRetries >= maxNoOfRetries) {
                    modbusRequest.increaseNoOfRetries(transactionId);
                    this._transactions.delete(transactionId);

                    if(!modbusRequest.failed) return resolve(false);

                    return reject(new TransactionTimeoutError(`Transaction ID ${transactionId} timed out after ${modbusRequest.noOfRetries} retries.`));
                }

                setTimeout(checkTransactionStatus, 500);
            }

            checkTransactionStatus();

        })
    }

    get currentTransactionResponseInProgress(): ModbusRequest {
        return this._currentTransactionResponse;
    }

}