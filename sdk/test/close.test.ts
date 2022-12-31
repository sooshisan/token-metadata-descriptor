import test from 'tape';
import BN from 'bn.js';

import {
  initialize,
  close
} from "../src/actions";
import { Encoding } from "../src/lib/src";

import { killStuckProcess, TestDriver } from './setup';

killStuckProcess();

test('[START]: Close descriptor', async (t) => {
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
    })
  });

  const { accounts, addressAccountInfo } = await testDriver.txHandler({
    executeTx: () => close({
      connection,
      payer: payerKp,
      destination: payer,
      mint: nft.mint.address,
      signers: [payerKp]
    }),
    accounts: [payer, initializeResult.address],
    fetchTxAddressAccountInfo: true
  });

  const payerAccount = accounts[payer.toBase58()];
  t.true(payerAccount.after.lamports - payerAccount.before.lamports > 0, "Assert payer balance increased")

  t.true(addressAccountInfo === null || addressAccountInfo.data.length === 0,
    "Assert descriptor account zeroed out");

  t.ok(true, "[END]");
});