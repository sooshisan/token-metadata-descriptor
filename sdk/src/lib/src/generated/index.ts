import { PublicKey } from '@solana/web3.js'
export * from './errors'
export * from './instructions'
export * from './types'

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = 'DesCwDwfrbxTDSjAm5Xjqh9Cij5Ucb46F6qH7cwieXB'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
