import { toBase64Url, toHex } from "./encoding";

/** Web Crypto sha256 → hex. Available in Convex V8 isolate (queries,
 *  mutations, http actions) — no Node import needed. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(buf));
}

/** Cryptographically random 32-byte token, base64url-encoded with the
 *  `lps_` prefix so the http surface can route it to the per-user lookup. */
export function generateMcpToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `lps_${toBase64Url(bytes)}`;
}
