import { Metaplex, Sft, SftWithToken, Nft, NftWithToken } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

type FindMetaplexNftArgs = {
    client: Metaplex | Connection,
    mint: PublicKey,
}

const isInstanceOfMetaplex = (
    instance: Metaplex | Connection
): instance is Metaplex => {
    return (<Metaplex>instance).nfts !== undefined;
}

export const findMetaplexNft = async (
    args: FindMetaplexNftArgs
): Promise<Sft | SftWithToken | Nft | NftWithToken> => {
    let client = isInstanceOfMetaplex(args.client)
        ? args.client
        : new Metaplex(args.client);

    const nft = await client.nfts().findByMint({ mintAddress: args.mint });
    if (nft === undefined) {
        throw new Error(`Unable to find NFT for mint ${args.mint}`);
    }

    return nft;
}