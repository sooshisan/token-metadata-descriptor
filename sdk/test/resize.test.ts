import test from 'tape';
import BN from 'bn.js';

import { MAX_DATA_LEN } from '../src/';
import {
  initialize,
  resize
} from "../src/actions";
import { Encoding } from "../src/lib/src";

import { killStuckProcess, TestDriver } from './setup';
import { expectException } from "./helpers";

killStuckProcess();

test('[START]: Increase descriptor by a factor of 2', async (t) => {
  const testDriver = new TestDriver();

  const { payer, payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  const dataSizeRaw = 1000;
  const { result: initializeResult } = await testDriver.txHandler({
    executeTx: () => initialize({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      dataSize: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
  });

  const { accounts } = await testDriver.txHandler({
    executeTx: () => resize({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      newSize: new BN(dataSizeRaw * 2),
      signers: [payerKp]
    }),
    accounts: [payer, initializeResult.address],
  });

  const payerAccount = accounts[payer.toBase58()];
  t.true(payerAccount.after.lamports - payerAccount.before.lamports < 0, "Assert payer balance decreased")

  const descriptorAccount = accounts[initializeResult.address.toBase58()];
  t.true(descriptorAccount.after.lamports - descriptorAccount.before.lamports > 0, "Assert descriptor balance increased")

  t.ok(true, "[END]");
});


test('[START]: Decrease descriptor by a factor of 2', async (t) => {
  const testDriver = new TestDriver();

  const { payer, payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  const dataSizeRaw = 1000;
  const { result: initializeResult } = await testDriver.txHandler({
    executeTx: () => initialize({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      dataSize: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
  });

  const { accounts } = await testDriver.txHandler({
    executeTx: () => resize({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      newSize: new BN(dataSizeRaw / 2),
      signers: [payerKp]
    }),
    accounts: [payer, initializeResult.address],
  });

  const payerAccount = accounts[payer.toBase58()];
  t.true(payerAccount.after.lamports - payerAccount.before.lamports > 0, "Assert payer balance increased")

  const descriptorAccount = accounts[initializeResult.address.toBase58()];
  t.true(descriptorAccount.after.lamports - descriptorAccount.before.lamports < 0, "Assert descriptor balance decreased")

  t.ok(true, "[END]");
});


test('[START]: Attempt to increase descriptor beyond max account size', async (t) => {
  const testDriver = new TestDriver();

  const { payerKp } = await testDriver.initializeFundedKp();
  const connection = testDriver.getConnection();
  const nft = await testDriver.mintNft();

  const dataSizeRaw = 1000;
  await testDriver.txHandler({
    executeTx: () => initialize({
      connection,
      payer: payerKp,
      mint: nft.mint.address,
      encoding: Encoding.Base64,
      dataSize: new BN(dataSizeRaw),
      signers: [payerKp]
    }),
  });

  expectException(
    t,
    () => testDriver.txHandler({
      executeTx: () => resize({
        connection,
        payer: payerKp,
        mint: nft.mint.address,
        newSize: new BN(MAX_DATA_LEN + 1),
        signers: [payerKp]
      }),
    })
  );

  t.ok(true, "[END]");
});
