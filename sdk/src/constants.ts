import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// 10_240 accounting for 46 bytes of overhead
export const EMPTY_DESCRIPTOR_SIZE = 46;
export const DATA_START_IDX_BN = new BN(EMPTY_DESCRIPTOR_SIZE);

export const MAX_ACCOUNT_SIZE = 10_240;
export const MAX_ACCOUNT_SIZE_BN = new BN(MAX_ACCOUNT_SIZE);

export const MAX_DATA_LEN = 10_194;

export const TOKEN_METADATA_KEY = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(TOKEN_METADATA_KEY);
