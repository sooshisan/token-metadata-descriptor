import {
    NftWithToken,
    keypairIdentity, Metaplex,
} from "@metaplex-foundation/js";
import {
    GenLabeledKeypair,
    LoadOrGenKeypair,
    LOCALHOST,
} from '@metaplex-foundation/amman-client';
import {
    AccountInfo,
    Connection,
    Keypair,
    PublicKey
} from "@solana/web3.js";

import { amman } from '.';
import { TransactionResult } from "src/types";
import { getAccountInfos, printTxLogMessages } from "../helpers";
import { MaybeAccountInfo } from "test/types";

type MintNftArgs = {
    uri: string;
    name: string;
    sellerFeeBasisPoints: number;
}

const DEFAULT_MINT_ARGS: MintNftArgs = {
    uri: "https://arweave.net/123",
    name: "My NFT",
    sellerFeeBasisPoints: 500
}

// accounts: { [key: string]: AccountInfo<Buffer> };
type TxHandlerArgs = {
    accounts?: PublicKey[];
    executeTx: () => Promise<TransactionResult>,
    fetchTxAddressAccountInfo?: boolean;
}

type TxHandlerResponse = {
    accounts?: {
        [key: string]: {
            "before": MaybeAccountInfo,
            "after": MaybeAccountInfo
        }
    };
    result: TransactionResult;
    addressAccountInfo?: AccountInfo<Buffer>;
}

export class TestDriver {
    readonly getKeypair: LoadOrGenKeypair | GenLabeledKeypair;
    readonly connection: Connection;
    readonly metaplex: Metaplex;

    constructor(readonly resuseKeypairs = false) {
        this.getKeypair = resuseKeypairs ? amman.loadOrGenKeypair : amman.genLabeledKeypair;
        this.connection = new Connection(LOCALHOST, 'confirmed');
        this.metaplex = new Metaplex(this.connection);
    }

    getConnection = () => this.connection;

    /**
     * Funds a new keypair with `funds` SOL
     */
    initializeFundedKp = async (funds: number = 2) => {
        const [payer, payerKp] = await this.getKeypair('Payer');

        await amman.airdrop(this.connection, payer, funds);

        // default; assign as metaplex object keypair
        this.metaplex.use(keypairIdentity(payerKp));

        return {
            payer,
            payerKp,
        };
    }

    withMetaplexKpIdentity = (kp: Keypair) => {
        // default; assign as metaplex object keypair
        this.metaplex.use(keypairIdentity(kp));
    }

    mintNft = async (args?: MintNftArgs): Promise<NftWithToken> => {
        const mintingArgs = args ? args : DEFAULT_MINT_ARGS;

        const { nft } = await this.metaplex.nfts().create({
            uri: mintingArgs.uri,
            name: mintingArgs.name,
            sellerFeeBasisPoints: mintingArgs.sellerFeeBasisPoints
        });

        return nft;
    }

    txHandler = async (
        args: TxHandlerArgs
    ): Promise<TxHandlerResponse> => {
        let accounts = undefined;
        if (args.accounts && args.accounts.length > 0) {
            const accountInfos = await getAccountInfos(this.connection, ...args.accounts);

            accounts = args.accounts.reduce((acc, curr, idx) => {
                acc[curr.toBase58()] = {
                    "before": accountInfos[idx]
                }
                return acc;
            }, {});
        }

        const result = await args.executeTx();
        await this.connection.confirmTransaction(result.signature);

        let addressAccountInfo = undefined;
        if (args.fetchTxAddressAccountInfo) {
            addressAccountInfo = await this.connection.getAccountInfo(result.address);
        }

        if (accounts) {
            const accountInfos = await getAccountInfos(this.connection, ...args.accounts);

            args.accounts.forEach((key, idx) => {
                const keyStr = key.toBase58();

                accounts[keyStr] = {
                    ...accounts[keyStr],
                    "after": accountInfos[idx]
                }
            });
        }

        await printTxLogMessages(this.connection, result.signature);

        return {
            accounts,
            result,
            addressAccountInfo
        }
    }
}