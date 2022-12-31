import { AccountInfo } from "@solana/web3.js";

export type MaybeAccountInfo = AccountInfo<Buffer> | undefined;
