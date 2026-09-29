# A04 — Cryptographic Failures

**Where:** `backend/src/utils/hashPassword.ts`
**Flow:** Register (`POST /auth/register`) and Login (`POST /auth/login`)

**Status:** ✅ Fixed — [`2d20509`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/2d20509)

---

## Context

Passwords are hashed with MD5 and no salt before being stored.

```ts
// backend/src/utils/hashPassword.ts
export async function hashPassword(password: string) {
  const hashedPassword = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  return hashedPassword;
}
```

MD5 is deterministic and unsalted: the same password always produces the same hash. This enables:
- **Rainbow table lookup** — hashes of common passwords (`123456`, `password`, etc.) are already precomputed and public.
- **Reused password detection** — if two users share the same hash in the `password` column, it's known they use the same password, without ever cracking it.
- **Fast brute force** — MD5 is optimized for speed (the opposite of what you want for password hashing); modern GPUs compute billions of MD5 hashes per second.

## PoC

```bash
# MD5 hash of "123456"
echo -n "123456" | md5sum
# e10adc3949ba59abbe56e057f20f883e
```

That specific hash is in any public rainbow table — a reverse lookup returns `123456` instantly. With read access to the database (via another vuln, a leaked backup, etc.), most weak passwords in the system are recovered in seconds.

## Impact

A database leak effectively exposes most passwords in plaintext, despite being "hashed".

## Planned fix

Replace with `bcrypt` (or `argon2`), which generates a per-password salt automatically and is deliberately slow (configurable cost factor), making brute force and rainbow table attacks impractical:

```ts
import bcrypt from "bcrypt";
const hashedPassword = await bcrypt.hash(password, 12);
```

---

## Fix applied

MD5 replaced with `bcrypt` at cost factor 12 ([`2d20509`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/2d20509)). `hashPassword` now returns a real bcrypt hash (self-salted), and login uses `bcrypt.compare()` instead of comparing hashes for equality — the old `===` comparison stopped being valid the moment the hash is no longer deterministic per-password.

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
