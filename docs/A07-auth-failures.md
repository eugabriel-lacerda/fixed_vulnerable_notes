# A07 — Authentication Failures

**Where:** `backend/src/utils/generateToken.ts`, `backend/src/controllers/AuthController.ts`
**Flow:** Register (`POST /auth/register`) and Login (`POST /auth/login`)

**Status:** Part 1 ✅ Fixed, Part 2 ✅ Fixed, Part 3 ✅ Fixed — all in [`1d53258`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/1d53258) except Part 2's rate limiting, added earlier in [`556bcaa`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/556bcaa)

---

## Part 1 — JWT without expiration

The JWT issued after register/login is signed without an expiration.

```ts
// backend/src/utils/generateToken.ts
const JWT_SECRET = "secret123";

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET);
}
```

`jwt.sign()` is called without the `expiresIn` option. By default, `jsonwebtoken` does not expire tokens automatically — once issued, a token is valid forever (until the secret is rotated).

## PoC

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'
```

The returned `token` can be used in authenticated requests indefinitely — months or years later, with no re-login and no active-session check. If a token leaks (logs, XSS, a compromised device), the attacker gets permanent access to the account, with no expiration window forcing revalidation.

## Impact

A stolen token grants permanent account access, with no need to capture credentials again.

## Planned fix

Add an expiration.

```ts
jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
```

### Fix applied

Implemented exactly as planned ([`1d53258`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/1d53258)) — tokens now carry a 1h `exp` claim, confirmed by decoding a fresh token and checking `exp - iat == 3600`.

## Part 2 — No lockout after repeated failed login attempts

```ts
// backend/src/controllers/AuthController.ts
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await loginUser(email, password);
      return res.status(200).json(user);
    } catch (error) {
       if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
    }
}
```

`login` has no concept of attempt count. Every request is evaluated independently — there's no counter per email/IP, no lockout, no delay after repeated failures. Combined with the weak MD5 hashing from [A04](A04-crypto-failures.md), this makes the endpoint viable for online brute-force or credential-stuffing attacks: an attacker can fire unlimited login requests per second with no penalty.

### PoC

```bash
for i in $(seq 1 1000); do
  curl -s -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@test.com","password":"guess'"$i"'"}'
done
```

Nothing in the API slows this down, blocks the IP, or locks the account after N failures — the loop above runs at full speed until a correct guess lands or the script stops.

### Impact

Weak or common passwords can be brute-forced online, with no friction at all. Combined with A09's missing logging (below), these attempts also leave no trace.

### Planned fix

Add a rate limiter (e.g. `express-rate-limit`) scoped to the login route, and/or an account lockout after N consecutive failures within a time window, with exponential backoff or a temporary cooldown.

### Fix applied 

A per-IP rate limiter (`express-rate-limit`, 5 requests/15min) was added to `/auth/login` and the other auth routes ([`556bcaa`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/556bcaa)), which neutralizes the PoC above (a single-machine loop hits the limit almost immediately instead of running to completion).

Per-account lockout (independent of IP) was evaluated and deliberately **not implemented**: it only adds protection against a distributed/IP-rotating attacker, a scenario the documented PoC doesn't demonstrate, and it would require either in-memory state (lost on restart, doesn't scale past one instance) or a new DB table/migration for a threat model this project isn't targeting. Rate limiting is considered sufficient mitigation for the scope of this project; full account lockout is left as a documented gap rather than implemented for the sake of closing the finding.

## Part 3 — Password reset code never expires

```ts
// backend/src/services/PasswordResetService.ts
export async function confirmPasswordReset(email: string, code: string, newPassword: string) {
  const user = await findUserByEmail(email);
  // ...
  const resetCode = await PasswordResetRepository.findLatestByUserId(user.id);

  if (!resetCode || resetCode.code !== code) {
    throw new AppError("Invalid reset code", 400);
  }
  // ...
}
```

The `password_reset_codes` table stores a `created_at` timestamp for every generated code, but `confirmPasswordReset` never reads it — the code is compared for equality and nothing else. A code generated today is just as valid a year from now as it was the moment it was issued.

### PoC

```bash
# Request a code once
curl -X POST http://localhost:3002/auth/recover-password \
  -H "Content-Type: application/json" -d '{"email":"user@test.com"}'
# → code printed to server console, e.g. 461181

# ... any amount of time later, the same code still works ...
curl -X POST http://localhost:3002/auth/recover-password/confirm \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","code":"461181","newPassword":"newpass"}'
# → 200, password updated
```

### Impact

A code intercepted or guessed long after it was issued (leaked in a log, cached in a proxy, brute-forced slowly over days to dodge naive detection — see [A06](A06-insecure-design.md)) remains a valid account-takeover vector indefinitely, since there's no window after which it stops working.

### Planned fix

Check `created_at` against a short TTL (e.g. 10 minutes) before accepting a code, and delete or mark it used after a single successful confirmation so it can't be replayed.

### Fix applied

Implemented as planned ([`1d53258`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/1d53258)): a 10-minute TTL is enforced (computed in Postgres via `EXTRACT(EPOCH FROM (NOW() - created_at))`, avoiding a Node/Postgres timezone mismatch bug found during testing — computing the age in JS from a naive timestamp string produced a negative age and never expired anything), and the code row is deleted immediately after a successful confirmation, making replay impossible. Verified: a code artificially backdated 15 minutes is rejected with "Reset code expired"; a fresh code still works; reusing an already-consumed code fails.

## Related note (A02)

`JWT_SECRET = "secret123"` is also hardcoded in source instead of an environment variable — covered separately in the **A02 — Security Misconfiguration** doc.

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
