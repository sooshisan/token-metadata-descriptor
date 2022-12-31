import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
} from "@solana/web3.js";
import BN from 'bn.js'

import {
  createInitializeInstruction,
  Encoding,
  InitializeInstructionAccounts,
  InitializeInstructionArgs,
  PROGRAM_ID,
} from "../lib/src";
import {
  createAndSignVersionedTransaction,
  sendAndConfirmVersionedTransaction,
} from "../utils";
import { generateDescriptorPda } from "../accounts";
import { TransactionResult } from "../types";
import { MAX_ACCOUNT_SIZE, MAX_DATA_LEN, TOKEN_METADATA_PROGRAM_ID } from "../constants";
import { findMetaplexNft, flattenSigners, getSignablePayer } from "../helpers";

type InitializeParams = {
  connection: Connection,
  payer: PublicKey | Keypair,
  mint: PublicKey,
  dataSize?: BN,
  encoding: Encoding,
  signers: Signer[]
}

export const initialize = async (
  args: InitializeParams
): Promise<TransactionResult> => {
  const payer = getSignablePayer(args.payer);
  const { address, bump } = await generateDescriptorPda(args.mint, PROGRAM_ID);

  const nft = await findMetaplexNft({
    client: args.connection,
    mint: args.mint
  });

  const dataSize = args.dataSize
    ? args.dataSize
    : new BN(0);

  // sanity check in client code
  if (dataSize.toNumber() > MAX_DATA_LEN) {
    throw new Error(`Full account size must not exceed ${MAX_ACCOUNT_SIZE} bytes, and data must not exceed ${MAX_DATA_LEN}`);
  }

  const initializeIx = createInitializeInstruction(
    {
      payer: payer.pk,
      authority: nft.updateAuthorityAddress,
      descriptor: address,
      mint: args.mint,
      tokenMetadata: nft.metadataAddress,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    } as InitializeInstructionAccounts,
    {
      dataSize,
      encoding: args.encoding,
      bump,
    } as InitializeInstructionArgs
  );

  const transaction = await createAndSignVersionedTransaction(
    args.connection,
    payer.pk,
    [initializeIx],
    flattenSigners([payer.kp, args.signers]),
  );

  const signature = await sendAndConfirmVersionedTransaction(
    args.connection,
    transaction
  );

  return {
    signature,
    transaction,
    address,
  };
};
