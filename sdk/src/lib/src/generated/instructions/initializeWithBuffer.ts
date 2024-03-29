/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { Range, rangeBeet } from '../types/Range'
import { Encoding, encodingBeet } from '../types/Encoding'

/**
 * @category Instructions
 * @category InitializeWithBuffer
 * @category generated
 */
export type InitializeWithBufferInstructionArgs = {
  range: beet.COption<Range>
  encoding: Encoding
  bump: number
}
/**
 * @category Instructions
 * @category InitializeWithBuffer
 * @category generated
 */
export const initializeWithBufferStruct = new beet.FixableBeetArgsStruct<
  InitializeWithBufferInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['range', beet.coption(rangeBeet)],
    ['encoding', encodingBeet],
    ['bump', beet.u8],
  ],
  'InitializeWithBufferInstructionArgs'
)
/**
 * Accounts required by the _initializeWithBuffer_ instruction
 *
 * @property [_writable_, **signer**] payer
 * @property [**signer**] authority
 * @property [_writable_] descriptor
 * @property [] mint
 * @property [] buffer
 * @property [] tokenMetadata
 * @property [] tokenMetadataProgram
 * @category Instructions
 * @category InitializeWithBuffer
 * @category generated
 */
export type InitializeWithBufferInstructionAccounts = {
  payer: web3.PublicKey
  authority: web3.PublicKey
  descriptor: web3.PublicKey
  mint: web3.PublicKey
  buffer: web3.PublicKey
  tokenMetadata: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeWithBufferInstructionDiscriminator = [
  71, 20, 160, 53, 219, 26, 122, 146,
]

/**
 * Creates a _InitializeWithBuffer_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeWithBuffer
 * @category generated
 */
export function createInitializeWithBufferInstruction(
  accounts: InitializeWithBufferInstructionAccounts,
  args: InitializeWithBufferInstructionArgs,
  programId = new web3.PublicKey('DesCwDwfrbxTDSjAm5Xjqh9Cij5Ucb46F6qH7cwieXB')
) {
  const [data] = initializeWithBufferStruct.serialize({
    instructionDiscriminator: initializeWithBufferInstructionDiscriminator,
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
      pubkey: accounts.buffer,
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
