import {
  PublicKey,
} from "@solana/web3.js";
import { Descriptor, Pda } from "../types";
import { descriptorBeet } from "../lib/src";
import { findProgramAddress } from "../utils";

export const generateDescriptorPda = async (
  mint: PublicKey,
  programId: PublicKey
): Promise<Pda> => {
  const [address, bump] = await findProgramAddress(programId, [
    Buffer.from("descriptor", "utf8"),
    mint,
  ]);

  return {
    address,
    bump,
  } as Pda;
};

type DescriptorDataType = "string" | "buffer";

type ToDescriptorArgs = {
  buffer: Buffer | undefined;
  returnType?: DescriptorDataType;
  // returnType must be string to use this, otherwise ignore 
  removeWhitespace?: boolean;
}

// question: is there a better way to do this? extend the descriptor from solita?
export const toDescriptor = (
  args: ToDescriptorArgs
): Descriptor | undefined => {
  if (!args.buffer) {
    return undefined;
  }

  const [descriptor, resultingOffset] = descriptorBeet.deserialize(args.buffer);
  let data: Buffer | string = args.buffer.subarray(resultingOffset);

  if (args.returnType && args.returnType === 'string') {
    data = data.toString("utf-8");

    if (args.removeWhitespace) {
      data = data.replaceAll('\x00', '').trim();
    }
  }

  return {
    ...descriptor,
    data
  };
};
