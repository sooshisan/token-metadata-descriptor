# Token Metadata Descriptor

Token Metadata Descriptor is defines a way to extend Metaplex’s token metadata accounts on-chain. This is a specific implementation for how how any account can be extended on-chain and takes advantage of the update authority field maintained by the metadata. The protocol is written in such a way that it can be as simple or complex as a creator wants.

Please see this document for more info: https://broken-bellflower-f99.notion.site/Token-Metadata-Descriptor-6227a069bd1049e78fddc3ce1cbf36f1

## SDK documentation

See the dedicated README [here](./sdk/README.md).

## Program documentation

Rust crate is published [here](https://crates.io/crates/token-metadata-descriptor). See the dedicated README [here](./program/README.md).

## Environment Setup

_Note_: initial develop was done on MacOS, so those using other platforms may run into issues. PRs or issues to address problems are greatly appreciated.

1. Install Rust from https://rustup.rs
2. Install Solana from https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool
3. Install Anchor from https://www.anchor-lang.com/docs/installation
4. Run `yarn setup` to install dependencies for every directory (root, sdk, and tests) and build the program for the first time.

You are now ready to modify the code, deploy, and/or run the tests.

## Build

There are 2 options:

1. Simple build that generates a `.so` output: `yarn build`
2. Full build that generates a `.so` output and updates the SDK: `yarn full:build`

If you choose the former, please remember to manually run `yarn cp:binaries` to copy the `.so` build artifact(s) to the `local-binaries/` folder.

## Test

_Running_ the tests is easy, but I'll explain what's happening behind the scenes. The testing strategy in this repository is more complex than a vanilla Anchor project because we don't use Anchor's default provider to generate a typescript interface into the underlying program. Instead, we use [solita](https://github.com/metaplex-foundation/solita) to automatically generate an SDK from the program. We can then use and extend that SDK however we want.

I'll only cover how to test locally in this README. Testing on devnet or mainnet-beta as an exercise to the reader, if that's your thing.

**General steps**:

- Open a new tab in your preferred terminal application.
- Verify you don't have another isntance of the local validator already running. We'll start a local validator via [Amman](https://github.com/metaplex-foundation/amman) using the command: `yarn amman:start`. We use configuration in `.ammanrc.js` to tell Amman what programs and accounts we would like loaded onto the local validator.
- In another window, run `yarn test` to run the tests. Any time a test makes an RPC call, it will be to the program running on the local validator.
- Stop the local validator with `ctrl+c`.
- You can run a single test class by navigating to the `sdk/` directory and running `yarn tape dist/test/<name>.test.js` where `<name>` represents a real test file.

**Dependencies**:

There is a test dependency on [@sooshisan/solana-add-data-to-buffer](https://www.npmjs.com/package/@sooshisan/solana-add-data-to-buffer) in order to create a buffer with data in it. It's only used for testing. The on-chain code has never been deployed, so the `.so` binary is committed to git and included in the `local-binaries/` directory.

## LICENSE

Apache v2.0
