import test from 'tape';

import {
  initializeWithData
} from "../src/actions";
import { EMPTY_DESCRIPTOR_SIZE, Encoding } from '../src';
import { toDescriptor } from '../src/accounts';

import { killStuckProcess, TestDriver } from './setup';
import { expectException } from './helpers';
import { SUCH_BIG_DATA } from './helpers/constants';

killStuckProcess();

test('[START]: Initialize descriptor with data', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  var data = new Uint8Array(Buffer.from("hello world"));
  const dataSizeRaw = data.length;

  const { addressAccountInfo: descriptorInfo } = await testDriver.txHandler({
    executeTx: () => initializeWithData({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      data,
      encoding: Encoding.Utf8,
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

  t.ok(true, "[END]\n\n");
});

test('[START]: Attempt to initialize descriptor with too much data', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  var data = new Uint8Array(Buffer.from(SUCH_BIG_DATA));
  console.log(`Attempt to create descriptor with ${data.length} bytes`);

  expectException(
    t,
    () => testDriver.txHandler({
      executeTx: () => initializeWithData({
        connection,
        payer: payerKp,
        mint: nft.mint.address,
        data,
        encoding: Encoding.Utf8,
        signers: [payerKp]
      }),
      fetchTxAddressAccountInfo: true
    })
  );

  t.ok(true, "[END]\n\n");
});
