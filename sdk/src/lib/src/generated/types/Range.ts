/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type Range = {
  start: beet.bignum
  end: beet.bignum
}

/**
 * @category userTypes
 * @category generated
 */
export const rangeBeet = new beet.BeetArgsStruct<Range>(
  [
    ['start', beet.u64],
    ['end', beet.u64],
  ],
  'Range'
)