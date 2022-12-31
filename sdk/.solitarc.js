// @ts-check
const path = require("path");
const programDir = path.join(__dirname, "..", "program");
const idlDir = path.join(__dirname, "src", "lib", "idl");
const sdkDir = path.join(__dirname, "src", "lib", "src", "generated");
const binaryInstallDir = path.join(__dirname, ".crates");

module.exports = {
  idlGenerator: "anchor",
  programName: "token_metadata_descriptor",
  programId: "DesCwDwfrbxTDSjAm5Xjqh9Cij5Ucb46F6qH7cwieXB",
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
};
