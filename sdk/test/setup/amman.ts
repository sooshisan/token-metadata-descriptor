import { Amman } from '@metaplex-foundation/amman-client';
import { cusper } from '../helpers/errors';

import { PROGRAM_ADDRESS } from '../../src/lib/src/generated';
import { logDebug } from '.';

export const amman = Amman.instance({
    knownLabels: { [PROGRAM_ADDRESS]: 'Token Metadata Descriptor' },
    log: logDebug,
    errorResolver: cusper,
});