import { PublicKey, VersionedTransaction } from "@solana/web3.js";

export type TransactionResult = {
  signature: string;
  transaction: VersionedTransaction;
  address: PublicKey;
};