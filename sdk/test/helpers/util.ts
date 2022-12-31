import test from 'tape';

import { Connection, PublicKey } from "@solana/web3.js";
import { MaybeAccountInfo } from 'test/types';

export const expectException = async (
    test: test.Test,
    fn: () => Promise<any>
): Promise<void> => {
    try {
        await fn();
        test.fail('Expected exception, function succeeded');
    } catch (err) {
        // no-op
    }

    return;
}

export const getAccountInfos = async (connection: Connection, ...addresses: PublicKey[]): Promise<MaybeAccountInfo[]> => {
    const result = [];

    for (const address of addresses) {
        result.push(await connection.getAccountInfo(address));
    }

    return result;
}

export const printTxLogMessages = async (connection: Connection, signature: string) => {
    const transaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
    });

    console.log(`${signature} logs: `, transaction?.meta?.logMessages);
}
