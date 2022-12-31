import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
} from "@solana/web3.js";

import {
  createInitializeWithDataInstruction,
  Encoding,
  InitializeWithDataInstructionAccounts,
  InitializeWithDataInstructionArgs,
  PROGRAM_ID,
} from "../lib/src";
import {
  createAndSignVersionedTransaction,
  sendAndConfirmVersionedTransaction,
} from "../utils";
import { generateDescriptorPda } from "../accounts";
import { TransactionResult } from "../types";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";
import { findMetaplexNft, flattenSigners, getSignablePayer } from "../helpers";

type InitializeWithDataArgs = {
  connection: Connection,
  payer: PublicKey | Keypair,
  mint: PublicKey,
  data: Uint8Array,
  encoding: Encoding,
  signers: Signer[]
}

export const initializeWithData = async (args: InitializeWithDataArgs): Promise<TransactionResult> => {
  const payer = getSignablePayer(args.payer);

  const { address, bump } = await generateDescriptorPda(args.mint, PROGRAM_ID);

  const nft = await findMetaplexNft({
    client: args.connection,
    mint: args.mint
  });

  const initializeWithDataIx = createInitializeWithDataInstruction(
    {
      payer: payer.pk,
      authority: nft.updateAuthorityAddress,
      descriptor: address,
      mint: args.mint,
      tokenMetadata: nft.metadataAddress,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    } as InitializeWithDataInstructionAccounts,
    {
      encoding: args.encoding,
      bump,
      data: args.data
    } as InitializeWithDataInstructionArgs
  );

  const transaction = await createAndSignVersionedTransaction(
    args.connection,
    payer.pk,
    [initializeWithDataIx],
    flattenSigners([payer.kp, args.signers]),
  );

  const signature = await sendAndConfirmVersionedTransaction(
    args.connection,
    transaction
  );

  return {
    signature,
    transaction,
    address
  };
};
