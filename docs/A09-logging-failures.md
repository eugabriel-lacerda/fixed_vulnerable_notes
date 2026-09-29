# A09 — Security Logging and Alerting Failures

**Where:** `backend/src/controllers/AuthController.ts`
**Flow:** Register (`POST /auth/register`) and Login (`POST /auth/login`)

**Status:** ✅ Fixed — [`da796a6`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/da796a6)

---

## Context

Neither `register` nor `login` log anything about authentication events — no successful login, no failed login, no failed registration attempt.

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

Whether the login succeeds, fails with invalid credentials, or fails with an unexpected error, nothing is written to any log — no `console.log`, no logger, no audit trail. Same for `register`. The only thing that changes is the HTTP response the client receives; the server keeps no record of what happened.

## PoC

Run any number of failed login attempts:

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"wrong-password"}'
```

Check the server's stdout/logs — nothing related to this attempt appears. This is true whether it's one failed attempt or ten thousand (see [A07's brute-force PoC](A07-auth-failures.md#part-2--no-lockout-after-repeated-failed-login-attempts), which also produces zero log entries).

## Impact

- No way to detect a brute-force or credential-stuffing attack in progress — it looks identical to normal traffic from the server's point of view, because nothing is recorded either way.
- No way to investigate after the fact: if an account is compromised, there's no audit trail showing when/how many login attempts happened, from which IP, or whether the attacker used a leaked credential list.
- No signal to feed into any alerting system (fail2ban, SIEM, anomaly detection) — those all depend on structured logs existing in the first place.

## Planned fix

Log authentication events with enough structure to be queryable and alertable — at minimum: timestamp, email attempted, IP address, outcome (success/failure), and reason on failure (invalid password vs. user not found, without exposing which one to the client — see [A07](A07-auth-failures.md)'s generic error message).

```ts
logger.warn("login_failed", { email, ip: req.ip, reason: "invalid_credentials" });
logger.info("login_success", { userId: user.id, ip: req.ip });
```

Pair this with the A07 rate limiter/lockout — the log is what lets you notice the attack, the lockout is what stops it.

## Fix applied

Implemented as planned ([`da796a6`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/da796a6)): `register`/`login` now log `{email, ip, outcome, reason}` on both success and failure via `console.log`/`console.warn`. `reason` on a failed login is the fixed string `"invalid_credentials"` regardless of whether the account exists — matching A07's generic client-facing error, so the log itself doesn't become an enumeration oracle for anyone who can read it. `email` is passed through `sanitizeForLog` (strips `\r\n`) before being logged; verified an email containing a newline is rejected by Zod's `.email()` validation before it would even reach the log call, so the sanitizer is defense-in-depth rather than the only barrier.

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
