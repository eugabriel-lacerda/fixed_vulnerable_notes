# 🔒 Vuln Notes — Fixed Version (AppSec Portfolio)

> This repository is a fork of [vulnerable_notes](https://github.com/eugabriel-lacerda/vulnerable_notes), preserving its full commit history, where each of the 10 deliberately introduced OWASP Top 10:2025 vulnerabilities is fixed one commit at a time. A DevSecOps layer (CI + SCA + SAST + DAST) sits on top, first capturing the vulnerabilities as tooling findings, then showing each fix turn a finding green.

🔧 **Currently in active development — built in public.** Follow along on [LinkedIn](https://www.linkedin.com/in/gabriel-lacerda-nascimento/).

⬅️ **Vulnerable version (the "before"):** [vulnerable_notes](https://github.com/eugabriel-lacerda/vulnerable_notes)

---

## Project goal

I'm a fullstack developer transitioning into AppSec/WebSec. This project exists to demonstrate, in practice, that I understand each vulnerability beyond its name: how it shows up in code, how it's exploited, how it's fixed, and how tooling catches it.

It's part of a two-repo pair:
- **[vulnerable_notes](https://github.com/eugabriel-lacerda/vulnerable_notes):** a working app with the vulnerabilities implemented as part of normal development
- **This repo:** a fork of that repository, same commit history, with a DevSecOps pipeline added first (against the still-vulnerable code, so findings are captured), followed by one commit per fix — in reverse order of the scope list — so each fix's effect on the pipeline is visible commit by commit

---

## Approach

1. **Pipeline first, on vulnerable code.** GitHub Actions CI added before any fix, running SCA/SAST/DAST against the codebase as-is. Findings are expected here (vulnerable `jsonwebtoken`, SQLi, XSS, missing security headers, open CORS, etc).
2. **One commit per vulnerability fixed**, applied in the reverse order they were introduced.
3. **Pipeline goes green incrementally.** Each fix commit is directly comparable against the pipeline output before it — e.g. "here SAST still flagged X, here it no longer does."

### Tooling

| Layer | Tool | Catches |
|---|---|---|
| SCA | Dependabot + `npm audit` | Vulnerable `jsonwebtoken@8.5.1` |
| SAST | CodeQL + Semgrep (OWASP rule set) | SQLi (`sql.raw`), mass assignment, prototype pollution |
| DAST | OWASP ZAP baseline scan | Reflected/stored XSS at runtime, missing headers (no helmet), open CORS |

---

## Stack

- **Backend:** Node.js + Express + PostgreSQL (Drizzle ORM, raw SQL)
- **Frontend:** React + TypeScript (Vite, Tailwind v4)
- **Auth:** JWT
- **Local environment:** Docker Compose

---

## How to run

```bash
git clone https://github.com/eugabriel-lacerda/fixed_vulnerable_notes
cd fixed_vulnerable_notes/backend
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

API available at `http://localhost:3002` (or whatever `PORT` is set to in `.env`).

Apply the database schema:

```bash
npx drizzle-kit migrate
```

In a separate terminal, start the frontend:

```bash
cd fixed_vulnerable_notes/frontend
cp .env.example .env
npm install
npm run dev
```

App available at `http://localhost:5173`.

---

## Vulnerabilities being fixed

Fixed in reverse order of introduction. Each doc has a `Status` line at the top with the exact fix commit(s).

| # | Category (OWASP 2025) | Where | Status |
|---|---|---|---|
| 1 | [A10](docs/A10-error-handling.md) — Mishandling of Exceptional Conditions | Raw database error leaked via note search | ✅ Fixed |
| 2 | [A03](docs/A03-supply-chain.md) — Software Supply Chain Failures | Pinned vulnerable `jsonwebtoken@8.5.1` | ✅ Fixed |
| 3 | [A06](docs/A06-insecure-design.md) — Insecure Design | No rate limit on password reset confirmation | ✅ Fixed |
| 4 | [A08](docs/A08-integrity-failures.md) — Software/Data Integrity Failures | Unfiltered merge on note update, no schema validation | ✅ Fixed |
| 5 | [A05](docs/A05-injection.md) — Injection | SQLi in note search (backend) + stored XSS in note body rendering (frontend) | ✅ Fixed |
| 6 | [A09](docs/A09-logging-failures.md) — Security Logging and Alerting Failures | No logging of login attempts | ✅ Fixed |
| 7 | [A07](docs/A07-auth-failures.md) — Authentication Failures | JWT without expiration, no login lockout, password reset code never expires | ✅ Fixed  |
| 8 | [A04](docs/A04-crypto-failures.md) — Cryptographic Failures | Password hashing (MD5, no salt) | ✅ Fixed |
| 9 | [A02](docs/A02-security-misconfiguration.md) — Security Misconfiguration | Hardcoded JWT secret, CORS wide open, missing helmet | ✅ Fixed |
| 10 | [A01](docs/A01-broken-access-control.md) — Broken Access Control | IDOR on `GET/PUT/DELETE /notes/:id` + mass assignment on `POST /notes` | ✅ Fixed |

Original vulnerability docs (context, PoC, impact, and now fix details) carried over and updated from the vulnerable repo: [docs/](docs/).

---

## Tooling findings

Extra findings surfaced by CodeQL/Semgrep/ZAP once the pipeline ran, not part of the original 10-item scope (some overlap with it — noted below). Fixed as they were found.

| Finding | Where | Found by | Commit |
|---|---|---|---|
| Hardcoded JWT secret | `authMiddleware.ts`, `generateToken.ts` | Semgrep | [`af84c4a`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/af84c4a) |
| Permissive CORS configuration | `server.ts` | CodeQL | [`7dbc894`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/7dbc894) |
| Weak password hash (MD5) | `hashPassword.ts` | CodeQL | [`2d20509`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/2d20509) |
| Missing rate limiting (auth routes) | `auth.routes.ts` | CodeQL | [`556bcaa`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/556bcaa) |
| Missing rate limiting (note routes) | `note.routes.ts` | CodeQL | [`aedc218`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/aedc218), [`e567f92`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/e567f92) |
| Log injection | `PasswordResetService.ts` | CodeQL | [`b753496`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/b753496) |
| Missing security headers (X-Powered-By, X-Content-Type-Options) | `server.ts` | ZAP API scan | [`7b7d309`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/7b7d309) |
| Missing security headers (frontend, CSP/COOP/COEP/etc) | `vite.config.ts` | ZAP baseline scan | [`280c77e`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/280c77e), [`3df1af1`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/3df1af1), [`d690866`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/d690866) |
| Unmatched routes returning HTML 404 instead of JSON | `server.ts` | ZAP API scan | [`8808901`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/8808901) |
| 500 on malformed/non-object JSON body | `errorHandler.ts` | ZAP API scan | [`b3ea335`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/b3ea335) |
| 500 on null byte in note search query | `NoteController.ts` | ZAP API scan | [`6eb7db4`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/6eb7db4) — overlaps [A10](docs/A10-error-handling.md) |
| SQL Injection in note search | `NoteRepository.ts` | ZAP API scan | [`cf2e945`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/cf2e945) — same bug as [A05](docs/A05-injection.md), found independently by both |
| Persistent XSS (reported, false positive) | `POST /notes` → `dangerouslySetInnerHTML` | ZAP API scan | Investigated, not fixed — [A05](docs/A05-injection.md#fix-applied-1) explains why the DOMPurify fix already neutralizes it despite the scanner still flagging it |

An explicit FAIL/WARN/INFO security gate policy (`.zap/api-rules.tsv`, `.zap/baseline-rules.tsv`) determines which ZAP findings actually fail the CI job.

---

## Repository structure

```
fixed_vulnerable_notes/
├── README.md
├── docs/
│   ├── A01-broken-access-control.md
│   ├── A02-security-misconfiguration.md
│   ├── A03-supply-chain.md
│   ├── A04-crypto-failures.md
│   ├── A05-injection.md
│   ├── A06-insecure-design.md
│   ├── A07-auth-failures.md
│   ├── A08-integrity-failures.md
│   ├── A09-logging-failures.md
│   └── A10-error-handling.md
├── .github/
│   └── workflows/         # CI: SCA + SAST + DAST
├── backend/
│   ├── docker-compose.yml
│   ├── drizzle.config.ts
│   ├── server.ts
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── database/
│       │   ├── schema.ts
│       │   └── migrations/
│       ├── routes/
│       ├── middlewares/
│       ├── errors/
│       ├── types/
│       └── utils/
└── frontend/
    └── src/
        ├── api/
        ├── components/
        │   ├── AppHeader/
        │   ├── AppLayout/
        │   ├── AuthLayout/
        │   ├── Button/
        │   ├── ConfirmDialog/
        │   ├── EmptyState/
        │   ├── Input/
        │   ├── NoteCard/
        │   ├── SearchInput/
        │   ├── Toast/
        │   └── UserMenu/
        ├── pages/
        │   ├── login/
        │   ├── register/
        │   ├── notes/
        │   ├── note-detail/
        │   └── recover-password/
        ├── types/
        └── utils/
```

---

## About this project

This is a study and portfolio project, not a real product. If you're a recruiter or technical reviewer and want to talk through the reasoning behind any specific fix or pipeline finding, I'm happy to walk through it, that's exactly what this project is for.
