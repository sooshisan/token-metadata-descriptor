/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { Encoding, encodingBeet } from './Encoding'
export type Descriptor = {
  discriminator: number[] /* size: 8 */
  bump: number
  mint: web3.PublicKey
  encoding: Encoding
  dataLen: number
}

/**
 * @category userTypes
 * @category generated
 */
export const descriptorBeet = new beet.BeetArgsStruct<Descriptor>(
  [
    ['discriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['mint', beetSolana.publicKey],
    ['encoding', encodingBeet],
    ['dataLen', beet.u32],
  ],
  'Descriptor'
)