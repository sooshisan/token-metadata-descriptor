import test from 'tape';
import BN from 'bn.js';

import {
  initialize,
  copy
} from "../src/actions";
import { Encoding } from "../src/lib/src";

import { killStuckProcess, TestDriver } from './setup';
import { createBuffer, expectException } from "./helpers";

killStuckProcess();

test('[START]: Copy buffer into descriptor', async (t) => {
  const testDriver = new TestDriver();

  const { payer, payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();

  const dataSizeRaw = 1000;

  // 1. create buffer
  const { result: createBufferResult, addressAccountInfo } = await testDriver.txHandler({
    executeTx: () => createBuffer({
      connection,
      payer: payerKp,
      dataLen: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  t.equal(addressAccountInfo.data.length, dataSizeRaw, "Assert buffer size");

  // 2. mint nft and create descriptor
  const nft = await testDriver.mintNft();
  const { result: initializeResult } = await testDriver.txHandler({
    executeTx: () => initialize({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      dataSize: new BN(dataSizeRaw),
      signers: [payerKp]
    })
  });

  // 3. copy buffer data into descriptor
  const { accounts } = await testDriver.txHandler({
    executeTx: () => copy({
      connection,
      payer: payerKp,
      buffer: createBufferResult.address,
      bufferRange: {
        start: new BN(0),
        end: new BN(dataSizeRaw)
      },
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      signers: [payerKp]
    }),
    accounts: [payer, initializeResult.address]
  });

  const payerAccount = accounts[payer.toBase58()];
  console.log("payer before: ", payerAccount.before.lamports,
    "; payer after: ", payerAccount.after.lamports,
    "; payer diff: ", payerAccount.after.lamports - payerAccount.before.lamports);

  const descriptorAccount = accounts[initializeResult.address.toBase58()];
  console.log("descriptor before: ", descriptorAccount.before.lamports,
    "; descriptor after: ", descriptorAccount.after.lamports,
    "; descriptor diff: ", descriptorAccount.after.lamports - descriptorAccount.before.lamports);

  t.ok(true, "[END]");
});


test('[START]: Attempt to copy bigger buffer into smaller descriptor', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();

  const dataSizeRaw = 1000;

  // 1. create buffer
  const { result: createBufferResult, addressAccountInfo } = await testDriver.txHandler({
    executeTx: () => createBuffer({
      connection,
      payer: payerKp,
      dataLen: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
    fetchTxAddressAccountInfo: true
  });

  t.equal(addressAccountInfo.data.length, dataSizeRaw, "Assert buffer size");

  // 2. mint nft and create descriptor
  const nft = await testDriver.mintNft();
  await testDriver.txHandler({
    executeTx: () => initialize({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      // half buffer length
      dataSize: new BN(dataSizeRaw / 2),
      signers: [payerKp]
    })
  });

  // 3. copy buffer data into descriptor
  expectException(
    t,
    () => testDriver.txHandler({
      executeTx: () => copy({
        connection,
        payer: payerKp,
        buffer: createBufferResult.address,
        bufferRange: {
          start: new BN(0),
          // original buffer size
          end: new BN(dataSizeRaw)
        },
        mint: nft.mint.address,
        encoding: Encoding.Base64,
        signers: [payerKp]
      }),
    })
  );

  t.ok(true, "[END]");
});
