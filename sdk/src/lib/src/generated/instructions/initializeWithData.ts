/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { Encoding, encodingBeet } from '../types/Encoding'

/**
 * @category Instructions
 * @category InitializeWithData
 * @category generated
 */
export type InitializeWithDataInstructionArgs = {
  encoding: Encoding
  bump: number
  data: Uint8Array
}
/**
 * @category Instructions
 * @category InitializeWithData
 * @category generated
 */
export const initializeWithDataStruct = new beet.FixableBeetArgsStruct<
  InitializeWithDataInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['encoding', encodingBeet],
    ['bump', beet.u8],
    ['data', beet.bytes],
  ],
  'InitializeWithDataInstructionArgs'
)
/**
 * Accounts required by the _initializeWithData_ instruction
 *
 * @property [_writable_, **signer**] payer
 * @property [**signer**] authority
 * @property [_writable_] descriptor
 * @property [] mint
 * @property [] tokenMetadata
 * @property [] tokenMetadataProgram
 * @category Instructions
 * @category InitializeWithData
 * @category generated
 */
export type InitializeWithDataInstructionAccounts = {
  payer: web3.PublicKey
  authority: web3.PublicKey
  descriptor: web3.PublicKey
  mint: web3.PublicKey
  tokenMetadata: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeWithDataInstructionDiscriminator = [
  229, 231, 179, 149, 108, 220, 109, 150,
]

/**
 * Creates a _InitializeWithData_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeWithData
 * @category generated
 */
export function createInitializeWithDataInstruction(
  accounts: InitializeWithDataInstructionAccounts,
  args: InitializeWithDataInstructionArgs,
  programId = new web3.PublicKey('DesCwDwfrbxTDSjAm5Xjqh9Cij5Ucb46F6qH7cwieXB')
) {
  const [data] = initializeWithDataStruct.serialize({
    instructionDiscriminator: initializeWithDataInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.descriptor,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenMetadata,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenMetadataProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}