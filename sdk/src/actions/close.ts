import {
    Connection,
    Keypair,
    PublicKey,
    Signer,
} from "@solana/web3.js";

import {
    createCloseInstruction,
    CloseInstructionAccounts,
    PROGRAM_ID,
} from "../lib/src";
import {
    createAndSignVersionedTransaction,
    sendAndConfirmVersionedTransaction,
} from "../utils";
import { generateDescriptorPda } from "../accounts";
import { TransactionResult } from "../types";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";
import { findMetaplexNft, flattenSigners, getSignablePayer } from "../helpers";

type CloseParams = {
    connection: Connection,
    payer: PublicKey | Keypair,
    destination: PublicKey,
    mint: PublicKey,
    signers: Signer[]
}

export const close = async (args: CloseParams): Promise<TransactionResult> => {
    const payer = getSignablePayer(args.payer);
    const { address } = await generateDescriptorPda(args.mint, PROGRAM_ID);

    const nft = await findMetaplexNft({
        client: args.connection,
        mint: args.mint
    });

    const updateIx = createCloseInstruction(
        {
            payer: payer.pk,
            authority: nft.updateAuthorityAddress,
            destination: args.destination,
            descriptor: address,
            mint: args.mint,
            tokenMetadata: nft.metadataAddress,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        } as CloseInstructionAccounts);

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
