# A03 — Software Supply Chain Failures

**Where:** `backend/package.json`

**Status:** ✅ Fixed — upgraded to `jsonwebtoken@^9.0.3`. `JWT_SECRET` fail-fast check confirmed present in `authMiddleware.ts` (see [A02](A02-security-misconfiguration.md)), so the `alg: none` gap described below cannot reopen silently.

---

## Context

`jsonwebtoken` is pinned to `8.5.1` (no `^`, so `npm install` never picks up a patch):

```json
"jsonwebtoken": "8.5.1"
```

This version has four known GitHub Security Advisories, all fixed in `9.0.0`:

- [GHSA-qwph-4952-7xr6](https://github.com/advisories/GHSA-qwph-4952-7xr6) — signature validation bypass via the `none` algorithm when `jwt.verify()` is called with a falsy secret/key
- [GHSA-hjrf-2m68-5959](https://github.com/advisories/GHSA-hjrf-2m68-5959) — insecure key retrieval can allow RSA public keys to be misused as HMAC secrets (algorithm confusion)
- [GHSA-8cf7-32gw-wr33](https://github.com/advisories/GHSA-8cf7-32gw-wr33) — unrestricted key types allow legacy/insecure keys (e.g. DSA) to be used where a stronger algorithm was expected
- [GHSA-27h2-hvpr-p74q](https://github.com/advisories/GHSA-27h2-hvpr-p74q) — insecure input validation in `jwt.verify()` (originally tracked as CVE-2022-23529, later partially retracted by Auth0/Unit 42 as exploitable only under specific unsafe usage — worth noting as an example of a CVE that needed nuance, not a blanket "vulnerable version" label)

> **Realism note:** in real projects this is almost always involuntary — a dependency stays pinned because nobody revisited it, not because a developer knowingly chose a vulnerable version. This project pins it on purpose to simulate that common scenario.

## Is this codebase actually exploitable right now?

Checked directly rather than assumed: **the most notable one, GHSA-qwph-4952-7xr6 (`alg: none` bypass), is not currently exploitable in this app.**

`jwt.verify()` in this version only accepts an unsigned (`alg: none`) token when the secret passed to it is falsy (`""`, `undefined`, `null`). Verified locally:

```js
const jwt = require("jsonwebtoken");
const forged = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOjk5OX0.";

jwt.verify(forged, "secret123"); // throws: "jwt signature is required"
jwt.verify(forged, "");          // returns { userId: 999 } — accepted
jwt.verify(forged, undefined);   // returns { userId: 999 } — accepted
```

`backend/src/middlewares/authMiddleware.ts` currently calls `jwt.verify(token, JWT_SECRET)` with `JWT_SECRET` hardcoded to `"secret123"` (see [A02](A02-security-misconfiguration.md)) — a real, non-empty string, so this specific bypass doesn't fire today.

## Why it's still worth documenting

The A02 planned fix is to replace the hardcoded secret with `process.env.JWT_SECRET!`. The `!` in that line is a TypeScript non-null assertion — it silences the compiler, not the runtime. If that environment variable is ever unset (a missing `.env` entry, a misconfigured deploy, a typo'd variable name), `process.env.JWT_SECRET` evaluates to `undefined` at runtime, `jwt.verify(token, undefined)` is exactly the vulnerable call this advisory describes, and every unsigned `alg: none` token gets accepted — full authentication bypass, forge a token for any `userId` with no secret knowledge required.

In other words: fixing A02 without also validating that the secret is actually present (and without upgrading past `9.0.0`, which closes this specific gap) can silently reintroduce this vulnerability instead of removing it.

## PoC (once the secret is undefined)

```bash
# Forged token: header {"alg":"none"} + payload {"userId":999} + empty signature
curl http://localhost:3002/notes \
  -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOjk5OX0."
```

## Impact

If triggered, full authentication bypass — an attacker can mint a token for any `userId` without ever knowing the signing secret, since there's no signature to forge in the first place.

## Planned fix

Upgrade to `jsonwebtoken@^9.0.0`, which removes this behavior entirely. Independently, always validate that `JWT_SECRET` is present and non-empty before the app starts (fail fast, don't let `jwt.verify()` silently receive `undefined`):

```ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
```

Also pin dependencies with a committed lockfile and run `npm audit` in CI to catch known-vulnerable versions before they ship.

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
