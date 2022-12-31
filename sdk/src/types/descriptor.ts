import { PublicKey } from "@solana/web3.js";
import { Descriptor as GeneratedDescriptor } from "../lib/src";

export type Pda = {
  address: PublicKey;
  bump: number;
};

export type Descriptor = {
  data: Buffer | string;
} & GeneratedDescriptor;