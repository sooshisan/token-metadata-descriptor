import test from 'tape';
import spok from 'spok';
import BN from 'bn.js';

import { EMPTY_DESCRIPTOR_SIZE, MAX_DATA_LEN } from '../src/';
import {
    initialize
} from "../src/actions";
import { toDescriptor } from '../src/accounts';
import { Encoding } from "../src/lib/src";

import { killStuckProcess, TestDriver } from './setup';
import { spokSamePubkey, expectException } from './helpers';

killStuckProcess();

test('[START]: Initialize descriptor with no size', async (t) => {
    const testDriver = new TestDriver();

    const { payerKp } = await testDriver.initializeFundedKp();
    const connection = testDriver.getConnection();
    const nft = await testDriver.mintNft();

    const { addressAccountInfo } = await testDriver.txHandler({
        executeTx: () => initialize({
            connection,
            payer: payerKp,
            mint: nft.mint.address,
            encoding: Encoding.Base64,
            signers: [payerKp]
        }),
        fetchTxAddressAccountInfo: true
    });

    t.equal(addressAccountInfo.data.length, EMPTY_DESCRIPTOR_SIZE, "Assert descriptor account size");
    const descriptor = toDescriptor({
        buffer: addressAccountInfo.data,
        removeWhitespace: true,
        returnType: 'string'
    });
    t.equal(descriptor.data, '', "Assert cleaned descriptor data is empty");

    spok(t, descriptor, {
        discriminator: spok.ne(undefined),
        bump: spok.number,
        mint: spokSamePubkey(nft.address),
        encoding: Encoding.Base64,
        dataLen: 0,
    });

    t.ok(true, "[END]");
});


test('[START]: Initialize descriptor with non-zero size', async (t) => {
    const testDriver = new TestDriver();

    const { payerKp } = await testDriver.initializeFundedKp();
    const connection = testDriver.getConnection();
    const nft = await testDriver.mintNft();

    const dataSizeRaw = 100;
    const { addressAccountInfo } = await testDriver.txHandler({
        executeTx: () => initialize({
            connection,
            payer: payerKp,
            mint: nft.mint.address,
            encoding: Encoding.Base64,
            dataSize: new BN(dataSizeRaw),
            signers: [payerKp]
        }),
        fetchTxAddressAccountInfo: true
    });

    t.equals(addressAccountInfo.data.length, EMPTY_DESCRIPTOR_SIZE + dataSizeRaw,
        "Assert descriptor account size");
    t.equal(toDescriptor({
        buffer: addressAccountInfo.data
    }).data.length,
        dataSizeRaw, "Assert descriptor data string length");

    const descriptor = toDescriptor({
        buffer: addressAccountInfo.data,
        removeWhitespace: true,
        returnType: 'string'
    });
    spok(t, descriptor, {
        discriminator: spok.ne(undefined),
        bump: spok.number,
        mint: spokSamePubkey(nft.address),
        encoding: Encoding.Base64,
        dataLen: dataSizeRaw,
        data: ''
    });

    t.ok(true, "[END]\n\n");
});

test('[START]: Initialize descriptor at max size', async (t) => {
    const testDriver = new TestDriver();

    const { payerKp } = await testDriver.initializeFundedKp();
    const connection = testDriver.getConnection();
    const nft = await testDriver.mintNft();

    const dataSizeRaw = MAX_DATA_LEN;
    const { addressAccountInfo } = await testDriver.txHandler({
        executeTx: () => initialize({
            connection,
            payer: payerKp,
            mint: nft.mint.address,
            encoding: Encoding.Base64,
            dataSize: new BN(dataSizeRaw),
            signers: [payerKp]
        }),
        fetchTxAddressAccountInfo: true
    });

    t.equals(addressAccountInfo.data.length, EMPTY_DESCRIPTOR_SIZE + dataSizeRaw,
        "Assert descriptor account size");
    t.equal(toDescriptor({ buffer: addressAccountInfo.data }).data.length,
        dataSizeRaw, "Assert descriptor data string length");

    const descriptor = toDescriptor({
        buffer: addressAccountInfo.data,
        removeWhitespace: true,
        returnType: 'string'
    });
    spok(t, descriptor, {
        discriminator: spok.ne(undefined),
        bump: spok.number,
        mint: spokSamePubkey(nft.address),
        encoding: Encoding.Base64,
        dataLen: dataSizeRaw,
        data: ''
    });

    t.ok(true, "[END]\n\n");
});

test('[START]: Attempt to initialize descriptor beyond max size', async (t) => {
    const testDriver = new TestDriver();

    const { payerKp } = await testDriver.initializeFundedKp();
    const connection = testDriver.getConnection();
    const nft = await testDriver.mintNft();

    const dataSizeRaw = MAX_DATA_LEN + 1;
    expectException(
        t,
        () => testDriver.txHandler({
            executeTx: () => initialize({
                connection,
                payer: payerKp,
                mint: nft.mint.address,
                encoding: Encoding.Base64,
                dataSize: new BN(dataSizeRaw),
                signers: [payerKp]
            })
        })
    );

    t.ok(true, "[END]\n\n");
});
