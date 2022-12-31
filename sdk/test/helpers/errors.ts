import { initCusper } from '@metaplex-foundation/cusper';
import { errorFromCode } from '../../src/lib/src/generated';

export const cusper = initCusper(errorFromCode);