# A02 — Security Misconfiguration

---

## Hardcoded JWT secret

**Where:** `backend/src/utils/generateToken.ts`

```ts
const JWT_SECRET = "secret123";
```

The signing secret is a literal string in source code instead of coming from an environment variable.

### Impact

- The secret is exposed to anyone with read access to the repository (including public repos, forks, or leaked source).
- Since the same secret is used across all environments (dev, staging, prod would all share it if deployed as-is), a leak anywhere compromises token signing everywhere.
- Anyone with the secret can forge valid JWTs for any `userId`, fully bypassing authentication.

### PoC

With the secret known (it's in this repo), a valid token for any user can be forged without ever logging in:

```js
const jwt = require("jsonwebtoken");
const forgedToken = jwt.sign({ userId: "any-uuid-here" }, "secret123");
// forgedToken is accepted by any endpoint that trusts this secret
```

### Planned fix

Move the secret to an environment variable, generated per environment and never committed:

```ts
const JWT_SECRET = process.env.JWT_SECRET!;
```

---

## CORS wide open

**Where:** `backend/server.ts`

```ts
app.use(cors({ origin: "*" }));
```

Every route in the API accepts cross-origin requests from any website, with no allow-list. `origin: "*"` is the CORS equivalent of "everyone is trusted" — a common quick fix when a developer hits a browser CORS error during local development and reaches for the broadest possible setting to make it go away, then never tightens it before deploy.

### PoC

```bash
curl -i -X OPTIONS http://localhost:3002/notes \
  -H "Origin: https://evil-attacker-site.com" \
  -H "Access-Control-Request-Method: GET"
```

Verified during development: the preflight response includes `Access-Control-Allow-Origin: *` regardless of what `Origin` header is sent — even an obviously adversarial one.

### Impact

Any website a logged-in user visits can make authenticated requests to this API from the victim's browser (their JWT is presumably attached client-side, e.g. via `localStorage` and an `Authorization` header set by the frontend's own JS) and read the response — a malicious page can silently exfiltrate the user's notes just by having them open a tab.

### Planned fix

Restrict `origin` to the specific frontend domain(s) that should be allowed to call this API:

```ts
app.use(cors({ origin: "https://your-frontend-domain.com" }));
```

## Missing `helmet()`

**Where:** `backend/server.ts` (absence, not a snippet)

The app never calls `helmet()` (or sets any equivalent security headers manually). Express sends no `Content-Security-Policy`, no `X-Content-Type-Options`, no `Strict-Transport-Security`, no `X-Frame-Options` — none of the baseline hardening headers that are close to a one-line default in most Express starters.

### PoC

```bash
curl -I http://localhost:3002/notes
```

None of the security-relevant headers `helmet()` would normally add are present in the response.

### Impact

No single catastrophic exploit on its own, but it removes several defense-in-depth layers at once: no clickjacking protection (`X-Frame-Options`), no MIME-sniffing protection (`X-Content-Type-Options`), no CSP to blunt the impact of any XSS that does land (relevant given [A05's stored XSS](A05-injection.md) plan on the frontend side). Each header is a low-cost mitigation; skipping all of them compounds the app's overall exposure.

### Planned fix

```ts
import helmet from "helmet";
app.use(helmet());
```

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
