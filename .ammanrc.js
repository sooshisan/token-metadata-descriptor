// [source] https://github.com/metaplex-foundation/amman/blob/master/amman/README.md
// [relayer] https://amman-explorer.metaplex.com

// @ts-check
"use strict";
const path = require("path");

const localDeployDir = path.join(__dirname, "local-binaries");
const { LOCALHOST, tmpLedgerDir } = require("@metaplex-foundation/amman");

function localDeployPath(programName) {
  const deployPath = path.join(localDeployDir, `${programName}.so`);
  console.log(`${programName} deploy path: ${deployPath}`);
  return deployPath;
}

const programs = [
  {
    label: "Token Metadata Descriptor",
    programId: "DesCwDwfrbxTDSjAm5Xjqh9Cij5Ucb46F6qH7cwieXB",
    deployPath: localDeployPath("token_metadata_descriptor"),
  },
  // local testing dependency
  {
    label: "Add Data to Buffer",
    programId: "DESnuptMcJi4PKoiUXfgkt3a41SsN7Qe4KRByevjf9EW",
    deployPath: localDeployPath("add_data_to_buffer"),
  },
];

const validator = {
  killRunningValidators: true,
  // By default Amman will pull the account data from the accountsCluster (can be overridden on a per account basis).
  // Can change based on RPC preferences.
  accountsCluster: "https://api.metaplex.solana.com",
  accounts: [
    {
      label: "Token Metadata Program",
      accountId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      // marking executable as true will cause Amman to pull the executable data account as well automatically
      executable: true,
    },
  ],
  programs,
  commitment: "confirmed",
  resetLedger: true,
  verifyFees: false,
  jsonRpcUrl: LOCALHOST,
  websocketUrl: "",
  ledgerDir: tmpLedgerDir(),
};

module.exports = {
  programs,
  validator,
  relay: {
    enabled: true, // process.env.CI == null,
    killlRunningRelay: true,
  },
  storage: {
    enabled: process.env.CI == null,
    storageId: "mock-storage",
    clearOnStart: true,
  },
};
