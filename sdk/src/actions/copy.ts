import {
    Connection,
    Keypair,
    PublicKey,
    Signer,
} from "@solana/web3.js";
import BN from "bn.js";

import {
    createCopyInstruction,
    CopyInstructionAccounts,
    CopyInstructionArgs,
    PROGRAM_ID,
    Encoding,
    Range
} from "../lib/src";
import {
    createAndSignVersionedTransaction,
    sendAndConfirmVersionedTransaction,
} from "../utils";
import { generateDescriptorPda } from "../accounts";
import { TransactionResult } from "../types";
import { MAX_ACCOUNT_SIZE_BN, DATA_START_IDX_BN, MAX_DATA_LEN, TOKEN_METADATA_PROGRAM_ID, MAX_ACCOUNT_SIZE } from "../constants";
import { findMetaplexNft, flattenSigners, getSignablePayer } from "../helpers";

type CopyParams = {
    connection: Connection,
    payer: PublicKey | Keypair,
    startIdx?: BN,
    buffer: PublicKey,
    bufferRange: Range,
    encoding: Encoding,
    mint: PublicKey,
    signers: Signer[]
}

export const copy = async (args: CopyParams): Promise<TransactionResult> => {
    const payer = getSignablePayer(args.payer);
    const { address } = await generateDescriptorPda(args.mint, PROGRAM_ID);

    const nft = await findMetaplexNft({
        client: args.connection,
        mint: args.mint
    });

    const startIdx = args.startIdx
        ? args.startIdx
        : new BN(0);

    // sanity check in client code
    const dataLength = (args.bufferRange.end as BN).sub(args.bufferRange.start as BN);
    const dataSize = startIdx.add(DATA_START_IDX_BN).add(dataLength);

    if (dataSize.gt(MAX_ACCOUNT_SIZE_BN)) {
        throw new Error(`Full account size must not exceed ${MAX_ACCOUNT_SIZE} bytes, and data must not exceed ${MAX_DATA_LEN}`);
    }

    const updateIx = createCopyInstruction(
        {
            payer: payer.pk,
            authority: nft.updateAuthorityAddress,
            buffer: args.buffer,
            descriptor: address,
            mint: args.mint,
            tokenMetadata: nft.metadataAddress,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        } as CopyInstructionAccounts,
        {
            descriptorStartRange: startIdx,
            bufferRange: args.bufferRange,
            encoding: args.encoding,
        } as CopyInstructionArgs);

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
