import { SiweMessage } from "siwe";

export type SiweMessageParams = {
  domain: string;
  address: string;
  statement?: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
};

// Create a SIWE message for wallet authentication
export function createSiweMessage(params: SiweMessageParams): SiweMessage {
  return new SiweMessage({
    domain: params.domain,
    address: params.address,
    statement: params.statement || "Sign in with Ethereum to the application.",
    uri: params.uri,
    version: params.version,
    chainId: params.chainId,
    nonce: params.nonce,
  });
}

// Generate a nonce for SIWE authentication
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Verify a SIWE message signature
export async function verifySiweSignature(
  message: SiweMessage,
  signature: string,
): Promise<boolean> {
  try {
    const result = await message.verify({
      signature,
    });
    return result.success;
  } catch (error) {
    console.error("SIWE verification error:", error);
    return false;
  }
}
