import { Keypair, PublicKey, Signer } from "@solana/web3.js";
import { SignablePayer } from "src/types";

export * from "./metaplex";

const isKeypairInstance = (
    payer: PublicKey | Keypair
): payer is Keypair => (<Keypair>payer).secretKey !== undefined;

export const getSignablePayer = (payer: PublicKey | Keypair): SignablePayer => {
    return isKeypairInstance(payer)
        ? {
            pk: (<Keypair>payer).publicKey,
            kp: [<Keypair>payer]
        } : {
            pk: payer,
            kp: []
        };
};

export const flattenSigners = (signers: Signer[][]): Signer[] => signers.reduce((acc, curr) => {
    if (curr.length > 0) {
        acc.push(...curr);
    }

    return acc;
}, []);

