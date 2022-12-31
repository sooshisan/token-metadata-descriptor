import {
    Connection,
    Keypair,
    PublicKey,
    Signer,
    SystemProgram,
} from "@solana/web3.js";
import BN from 'bn.js'

import {
    createResizeInstruction,
    ResizeInstructionAccounts,
    ResizeInstructionArgs,
    PROGRAM_ID,
} from "../lib/src";
import {
    createAndSignVersionedTransaction,
    sendAndConfirmVersionedTransaction,
} from "../utils";
import { generateDescriptorPda } from "../accounts";

import { TransactionResult } from "../types";
import { MAX_ACCOUNT_SIZE, MAX_DATA_LEN, TOKEN_METADATA_PROGRAM_ID } from "../constants";
import { findMetaplexNft, flattenSigners, getSignablePayer } from "../helpers";

type ResizeParams = {
    connection: Connection,
    payer: PublicKey | Keypair,
    mint: PublicKey,
    newSize: BN,
    signers: Signer[]
}

export const resize = async (args: ResizeParams): Promise<TransactionResult> => {
    const payer = getSignablePayer(args.payer);
    const { address } = await generateDescriptorPda(args.mint, PROGRAM_ID);

    const nft = await findMetaplexNft({
        client: args.connection,
        mint: args.mint
    });

    // sanity check in client code
    if (args.newSize.toNumber() > MAX_DATA_LEN) {
        throw new Error(`Full account size must not exceed ${MAX_ACCOUNT_SIZE} bytes, and data must not exceed ${MAX_DATA_LEN}`);
    }

    const updateIx = createResizeInstruction(
        {
            payer: payer.pk,
            authority: nft.updateAuthorityAddress,
            descriptor: address,
            mint: args.mint,
            tokenMetadata: nft.metadataAddress,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        } as ResizeInstructionAccounts,
        {
            newSize: args.newSize,
        } as ResizeInstructionArgs
    );

    const transaction = await createAndSignVersionedTransaction(
        args.connection,
        payer.pk,
        [updateIx],
        flattenSigners([payer.kp, args.signers]),
    );

    const signature = await sendAndConfirmVersionedTransaction(
        args.connection,
        transaction
    );

    return {
        signature,
        transaction,
        address,
    };
};
