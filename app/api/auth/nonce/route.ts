import { NextRequest, NextResponse } from "next/server";
import { generateNonce } from "@/app/lib/siwe";

export async function GET(req: NextRequest) {
  try {
    // Generate a random nonce
    const nonce = generateNonce();

    // Store the nonce in the session or database if needed
    // For simplicity, we're just returning it

    return NextResponse.json({ nonce }, { status: 200 });
  } catch (error) {
    console.error("Error generating nonce:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 },
    );
  }
}
