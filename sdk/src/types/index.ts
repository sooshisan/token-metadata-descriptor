import { Keypair, PublicKey } from "@solana/web3.js";

export * from "./descriptor";
export * from "./transaction";

export type SignablePayer = {
    pk: PublicKey;
    kp: Keypair[]
  }
  