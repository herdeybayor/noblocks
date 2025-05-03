import { jwtVerify, SignJWT } from "jose";

// Sign a new JWT token
export async function signJwt(
  payload: any,
  expiresIn: string = "1d",
): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production",
  );

  const iat = Math.floor(Date.now() / 1000);
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setNotBefore(iat)
    .sign(secret);
}

// Verify a JWT token
export async function verifyJwt<T>(token: string): Promise<T> {
  const secret = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production",
  );

  const { payload } = await jwtVerify(token, secret);
  return payload as T;
}
