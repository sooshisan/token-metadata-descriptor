#!/bin/bash

# directly build the only program in this repo
echo "building token_metadata_descriptor"
cd program
cargo build-bpf --bpf-out-dir ../local-binaries/
cd ../
