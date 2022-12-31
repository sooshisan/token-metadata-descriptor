import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export const createAndSignTransaction = async (
  connection: Connection,
  payer: Keypair,
  instructions: TransactionInstruction[],
  signers: Signer[]
): Promise<Transaction> => {
  const tx = new Transaction();
  tx.add(...instructions);
  tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  tx.feePayer = payer.publicKey;
  tx.partialSign(...signers);

  return tx;
};

export const createAndSignVersionedTransaction = async (
  connection: Connection,
  payer: PublicKey,
  instructions: TransactionInstruction[],
  signers: Signer[]
): Promise<VersionedTransaction> => {
  const transaction = new VersionedTransaction(
    new TransactionMessage({
      payerKey: payer,
      recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
      instructions,
    }).compileToV0Message()
  );

  transaction.sign(signers);

  return transaction;
};

export const sendAndConfirmVersionedTransaction = async (
  connection: Connection,
  transaction: VersionedTransaction
): Promise<string> => {
  const signature = await connection.sendTransaction(transaction);
  await connection.confirmTransaction(signature);

  return signature;
};

export const findProgramAddress = async (
  programId: PublicKey,
  seeds: (PublicKey | Uint8Array | string)[]
): Promise<[PublicKey, number]> => {
  const seed_bytes = seeds.map((s) => {
    if (typeof s === "string") {
      return Buffer.from(s);
    } else if ("toBytes" in s) {
      return s.toBytes();
    } else {
      return s;
    }
  });

  return await PublicKey.findProgramAddress(seed_bytes, programId);
};
