import test from 'tape';
import BN from 'bn.js';

import {
  initializeWithBuffer
} from "../src/actions";
import { EMPTY_DESCRIPTOR_SIZE, MAX_DATA_LEN, Encoding } from '../src';

import { toDescriptor } from '../src/accounts';

import { killStuckProcess, TestDriver } from './setup';
import { createBuffer, expectException } from './helpers';

killStuckProcess();

test('[START]: Initialize descriptor with buffer and no range', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  const dataSizeRaw = 1000;

  // 1. create buffer
  const { result: createBufferResult, addressAccountInfo: bufferInfo } = await testDriver.txHandler({
    executeTx: () => createBuffer({
      connection,
      payer: payerKp,
      dataLen: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  t.equal(bufferInfo.data.length, dataSizeRaw, "Assert buffer size");

  const { addressAccountInfo: descriptorInfo } = await testDriver.txHandler({
    executeTx: () => initializeWithBuffer({
      connection,
      payer: payerKp,
      buffer: createBufferResult.address,
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  // full descriptor account length
  t.equal(descriptorInfo.data.length, EMPTY_DESCRIPTOR_SIZE + dataSizeRaw, "Assert descriptor size");

  // parsed descriptor struct
  const descriptor = toDescriptor({
    buffer: descriptorInfo.data,
    removeWhitespace: true,
    returnType: 'string'
  });

  t.equal(descriptor.data.length, dataSizeRaw, "Assert descriptor data string length");
  t.equal(descriptor.data, bufferInfo.data.toString(), "Assert descriptor vs buffer contents");

  t.ok(true, "[END]\n\n");
});

// tldr; should be same as above

test('[START]: Initialize descriptor with buffer and full range', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  const dataSizeRaw = 1000;

  // 1. create buffer
  const { result: createBufferResult, addressAccountInfo: bufferInfo } = await testDriver.txHandler({
    executeTx: () => createBuffer({
      connection,
      payer: payerKp,
      dataLen: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  t.equal(bufferInfo.data.length, dataSizeRaw, "Assert buffer size");

  const { addressAccountInfo: descriptorInfo } = await testDriver.txHandler({
    executeTx: () => initializeWithBuffer({
      connection,
      payer: payerKp,
      buffer: createBufferResult.address,
      range: {
        start: new BN(0),
        end: new BN(dataSizeRaw)
      },
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  // full descriptor account length
  t.equal(descriptorInfo.data.length, EMPTY_DESCRIPTOR_SIZE + dataSizeRaw, "Assert descriptor size");

  // parsed descriptor struct
  const descriptor = toDescriptor({
    buffer: descriptorInfo.data,
    removeWhitespace: true,
    returnType: 'string'
  });

  t.equal(descriptor.data.length, dataSizeRaw, "Assert descriptor data string length");
  t.equal(descriptor.data, bufferInfo.data.toString(), "Assert descriptor vs buffer contents");

  t.ok(true, "[END]\n\n");
});


test('[START]: Initialize descriptor with buffer and subset range', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  const dataSizeRaw = 1000;

  // 1. create buffer
  const { result: createBufferResult, addressAccountInfo: bufferInfo } = await testDriver.txHandler({
    executeTx: () => createBuffer({
      connection,
      payer: payerKp,
      dataLen: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  t.equal(bufferInfo.data.length, dataSizeRaw, "Assert buffer size");

  const rangeStart = 100;
  const rangeEnd = 200;
  const { addressAccountInfo: descriptorInfo } = await testDriver.txHandler({
    executeTx: () => initializeWithBuffer({
      connection,
      payer: payerKp,
      buffer: createBufferResult.address,
      range: {
        start: new BN(rangeStart),
        end: new BN(rangeEnd)
      },
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  // full descriptor account length
  t.equal(descriptorInfo.data.length, EMPTY_DESCRIPTOR_SIZE + (rangeEnd - rangeStart), "Assert descriptor size");

  // parsed descriptor struct
  const descriptor = toDescriptor({
    buffer: descriptorInfo.data,
    removeWhitespace: true,
    returnType: 'string'
  });

  t.equal(descriptor.data.length, rangeEnd - rangeStart, "Assert descriptor data string length");
  t.equal(descriptor.data, bufferInfo.data.slice(rangeStart, rangeEnd).toString(), "Assert descriptor vs buffer contents");

  t.ok(true, "[END]\n\n");
});


test('[START]: Initialize descriptor with buffer beyond max range', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  const dataSizeRaw = MAX_DATA_LEN + 1;

  // 1. create buffer
  const { result: createBufferResult, addressAccountInfo: bufferInfo } = await testDriver.txHandler({
    executeTx: () => createBuffer({
      connection,
      payer: payerKp,
      dataLen: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  t.equal(bufferInfo.data.length, dataSizeRaw, "Assert buffer size");

  expectException(
    t,
    () => testDriver.txHandler({
      executeTx: () => initializeWithBuffer({
        connection,
        payer: payerKp,
        buffer: createBufferResult.address,
        mint: nft.mint.address,
        encoding: Encoding.Base64,
        signers: [payerKp]
      }),
      fetchTxAddressAccountInfo: true
    })
  );

  t.ok(true, "[END]\n\n");
});
