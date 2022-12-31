import { Specifications } from 'spok';
import { COption } from '@metaplex-foundation/beet';
import {
    PublicKey
} from "@solana/web3.js";

export const spokSamePubkey = (a: PublicKey | COption<PublicKey>): Specifications<PublicKey> => {
    const same = (b: PublicKey | null | undefined) => b != null && !!a?.equals(b);

    same.$spec = `spokSamePubkey(${a?.toBase58()})`;
    same.$description = `${a?.toBase58()} equal`;
    return same;
}
