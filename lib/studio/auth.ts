/**
 * The lock on /studio/.
 *
 * WHY THIS IS HAND-WRITTEN AND NOT NextAuth.
 *
 * There is exactly one account. There is no sign-up, no password reset,
 * no OAuth provider, no user table and no per-user data — the studio
 * either has the password or does not. An auth library solves problems
 * this door does not have, at the cost of a large dependency on a
 * project whose stated rule is zero runtime dependencies beyond the
 * framework. What is actually needed is a signed cookie, and the
 * platform ships the primitives for that.
 *
 * ⚠️ WEB CRYPTO, NOT node:crypto. This module is imported by proxy.ts,
 * which runs on the Edge runtime where `node:crypto` does not exist.
 * `crypto.subtle` is available in both places, so one implementation
 * serves the proxy, the pages and the Server Actions.
 *
 * ⚠️ THE COOKIE CARRIES NO IDENTITY, only an expiry and a signature
 * over it. There is nothing to steal from decoding it and nothing to
 * tamper with that the HMAC would not catch, because there is no user
 * to impersonate.
 */

export const SESSION_COOKIE = "studio-session";

/** A week. Long enough not to be a nuisance, short enough to expire. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. The studio refuses to run without it — see .env.example.`,
    );
  }
  return value;
}

/** Hex rather than base64url: no Buffer, and no padding to strip. */
async function hmac(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const imported = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", imported, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compare without leaking where the strings first differ.
 *
 * A plain `===` returns as soon as it finds a mismatched character, so
 * the time it takes reveals how much of a guess was correct — enough,
 * over many attempts, to recover a secret one character at a time.
 * Comparing every byte regardless costs nothing here and removes the
 * whole class of attack.
 */
function constantTimeEqual(a: string, b: string): boolean {
  /* Lengths are compared normally: the length of a secret is not the
     secret, and an early return on it avoids indexing past the end. */
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

/** Is this the studio's password? */
export async function passwordMatches(candidate: string): Promise<boolean> {
  /* Hash both sides before comparing. The raw password and the guess
     are almost never the same length, and `constantTimeEqual` returns
     early on a length mismatch — hashing makes both exactly 64 hex
     characters, so the comparison is uniform whatever was typed. */
  const secret = env("STUDIO_SECRET");
  const [a, b] = await Promise.all([
    hmac(candidate, secret),
    hmac(env("STUDIO_PASSWORD"), secret),
  ]);
  return constantTimeEqual(a, b);
}

/** A fresh session token: when it dies, and a signature over that. */
export async function issueSession(): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = String(expires);
  return `${payload}.${await hmac(payload, env("STUDIO_SECRET"))}`;
}

/**
 * Is this token ours, and still alive?
 *
 * Order matters: verify the signature BEFORE trusting the expiry.
 * Reading the timestamp first would mean deciding whether to bother
 * checking the signature based on a number the caller supplied.
 */
export async function sessionIsValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  let expected: string;
  try {
    expected = await hmac(payload, env("STUDIO_SECRET"));
  } catch {
    /* No secret configured. Fail closed — an unlocked dashboard is a
       worse outcome than a locked one. */
    return false;
  }
  if (!constantTimeEqual(signature, expected)) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}
