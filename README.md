# 📝 Vuln Notes — Vulnerable Version (AppSec Portfolio)

> ⚠️ **This repository contains deliberately introduced vulnerabilities, for educational purposes.**
> **Do not use this code in production or as a base for real projects.**

A personal notes application (Node/Express + PostgreSQL backend, React + TypeScript frontend) built to implement all 10 categories of the **OWASP Top 10:2025** on purpose. Each vulnerability is documented with an attack example, impact, and reference to the OWASP category.

🔧 **Currently in active development — built in public.** Follow along on [LinkedIn](https://www.linkedin.com/in/gabriel-lacerda-nascimento/).

➡️ **Fixed version (with full commit history of each fix):** coming soon

---

## Project goal

I'm a fullstack developer transitioning into AppSec/WebSec. This project exists to demonstrate, in practice, that I understand each vulnerability beyond its name, how it shows up in code, how it's exploited, and how it's fixed.

It's part of a two-repo pair:
- **This repo:** a working app with the vulnerabilities implemented as part of normal development
- **Fixed repo (coming soon):** a fork of this repository with each vulnerability fixed individually, preserving history for direct comparison. It will also introduce a DevSecOps layer on top of the fixes — GitHub Actions CI, SCA, SAST, and DAST — to show the vulnerabilities being caught by tooling, not just fixed by hand.

---

## Stack

- **Backend:** Node.js + Express + PostgreSQL (Drizzle ORM, raw SQL)
- **Frontend:** React + TypeScript (Vite, Tailwind v4)
- **Auth:** JWT
- **Local environment:** Docker Compose

---

## How to run

```bash
git clone <this-repo-url>
cd vuln_notes/backend
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
cd vuln_notes/frontend
cp .env.example .env
npm install
npm run dev
```

App available at `http://localhost:5173`.

---

## Implemented vulnerabilities

| # | Category (OWASP 2025) | Where | Docs |
|---|---|---|---|
| 1 | A01 — Broken Access Control | IDOR on `GET/PUT/DELETE /notes/:id` + mass assignment on `POST /notes` | [docs/A01-broken-access-control.md](docs/A01-broken-access-control.md) |
| 2 | A02 — Security Misconfiguration | Hardcoded JWT secret, CORS wide open, missing helmet | [docs/A02-security-misconfiguration.md](docs/A02-security-misconfiguration.md) |
| 3 | A04 — Cryptographic Failures | Password hashing (MD5, no salt) | [docs/A04-crypto-failures.md](docs/A04-crypto-failures.md) |
| 4 | A07 — Authentication Failures | JWT without expiration, no login lockout, password reset code never expires | [docs/A07-auth-failures.md](docs/A07-auth-failures.md) |
| 5 | A09 — Security Logging and Alerting Failures | No logging of login attempts | [docs/A09-logging-failures.md](docs/A09-logging-failures.md) |
| 6 | A05 — Injection | SQLi in note search (backend) + stored XSS in note body rendering (frontend) | [docs/A05-injection.md](docs/A05-injection.md) |
| 7 | A08 — Software/Data Integrity Failures | Unfiltered merge on note update, no schema validation | [docs/A08-integrity-failures.md](docs/A08-integrity-failures.md) |
| 8 | A06 — Insecure Design | No rate limit on password reset confirmation | [docs/A06-insecure-design.md](docs/A06-insecure-design.md) |
| 9 | A03 — Software Supply Chain Failures | Pinned vulnerable `jsonwebtoken@8.5.1` | [docs/A03-supply-chain.md](docs/A03-supply-chain.md) |
| 10 | A10 — Mishandling of Exceptional Conditions | Raw database error leaked via note search | [docs/A10-error-handling.md](docs/A10-error-handling.md) |

All 10 OWASP Top 10:2025 categories are implemented and documented, across both backend and frontend.

---

## Repository structure

```
vuln_notes/
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
        └── pages/
            ├── login/
            ├── register/
            ├── notes/
            ├── note-detail/
            └── recover-password/
```

Each file in `docs/` follows the same format: **context → proof of concept → impact → planned fix → OWASP reference**.

---

## About this project

This is a study and portfolio project, not a real product. If you're a recruiter or technical reviewer and want to talk through the reasoning behind any specific vulnerability, I'm happy to walk through it, that's exactly what this project is for.
