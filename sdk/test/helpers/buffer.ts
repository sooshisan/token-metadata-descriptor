import {
    Connection,
    Keypair,
    PublicKey,
    Signer,
    SystemProgram,
} from "@solana/web3.js";
import BN from "bn.js";

import {
    createInitializeBufferInstruction,
    InitializeBufferInstructionArgs,
    InitializeBufferInstructionAccounts,
    PROGRAM_ADDRESS as ADD_DATA_TO_BUFFER_PROGRAM_ADDRESS
} from "@sooshisan/solana-add-data-to-buffer";

import {
    createAndSignVersionedTransaction,
    sendAndConfirmVersionedTransaction,
    TransactionResult,
    flattenSigners,
    getSignablePayer
} from "../../src";

type CreateBufferArgs = {
    connection: Connection,
    payer: Keypair,
    withOffset?: BN,
    dataLen: BN,
    signers: Signer[]
}

export const createBuffer = async (
    args: CreateBufferArgs
): Promise<TransactionResult> => {
    const payer = getSignablePayer(args.payer);
    const newAccount = Keypair.generate();

    const rentExemptionAmount =
        await args.connection.getMinimumBalanceForRentExemption(args.dataLen.toNumber());
    const createAccountIx = SystemProgram.createAccount({
        fromPubkey: payer.pk,
        newAccountPubkey: newAccount.publicKey,
        lamports: rentExemptionAmount,
        space: args.dataLen.toNumber(),
        programId: new PublicKey(ADD_DATA_TO_BUFFER_PROGRAM_ADDRESS)
    });

    const initializeBufferIx = createInitializeBufferInstruction(
        {
            payer: payer.pk,
            buffer: newAccount.publicKey,
            systemProgram: SystemProgram.programId
        } as InitializeBufferInstructionAccounts,
        {
            withOffset: args.withOffset,
            dataLen: args.dataLen
        } as InitializeBufferInstructionArgs);

    const transaction = await createAndSignVersionedTransaction(
        args.connection,
        payer.pk,
        [createAccountIx, initializeBufferIx],
        flattenSigners([payer.kp, args.signers, [newAccount]]),
    );

    const signature = await sendAndConfirmVersionedTransaction(
        args.connection,
        transaction
    );

    return {
        signature,
        transaction,
        address: newAccount.publicKey
    };
}
