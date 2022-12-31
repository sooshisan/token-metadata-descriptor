import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
} from "@solana/web3.js";

import {
  createInitializeWithBufferInstruction,
  Encoding,
  InitializeWithBufferInstructionAccounts,
  InitializeWithBufferInstructionArgs,
  PROGRAM_ID,
  Range,
} from "../lib/src";
import {
  createAndSignVersionedTransaction,
  sendAndConfirmVersionedTransaction,
} from "../utils";
import { generateDescriptorPda } from "../accounts";
import { TransactionResult } from "../types";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";
import { findMetaplexNft, flattenSigners, getSignablePayer } from "../helpers";

type InitializeWithBufferArgs = {
  connection: Connection,
  payer: PublicKey | Keypair,
  buffer: PublicKey,
  mint: PublicKey,
  range?: Range,
  encoding: Encoding,
  signers: Signer[]
}

export const initializeWithBuffer = async (args: InitializeWithBufferArgs): Promise<TransactionResult> => {
  const payer = getSignablePayer(args.payer);
  const { address, bump } = await generateDescriptorPda(args.mint, PROGRAM_ID);

  const nft = await findMetaplexNft({
    client: args.connection,
    mint: args.mint
  });

  const initializeWithBufferIx = createInitializeWithBufferInstruction(
    {
      payer: payer.pk,
      authority: nft.updateAuthorityAddress,
      descriptor: address,
      mint: args.mint,
      buffer: args.buffer,
      tokenMetadata: nft.metadataAddress,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    } as InitializeWithBufferInstructionAccounts,
    {
      range: args.range,
      encoding: args.encoding,
      bump,
    } as InitializeWithBufferInstructionArgs
  );

  const transaction = await createAndSignVersionedTransaction(
    args.connection,
    payer.pk,
    [initializeWithBufferIx],
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
