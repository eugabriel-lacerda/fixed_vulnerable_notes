# A10 — Mishandling of Exceptional Conditions

**Where:** `backend/src/controllers/NoteController.ts`
**Flow:** Note search (`GET /notes/search?q=`)

**Status:** ✅ Fixed — [`111ac3d`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/111ac3d), [`6eb7db4`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/6eb7db4)

---

## Context

The search endpoint's catch block returns the raw database error message straight to the client:

```ts
// backend/src/controllers/NoteController.ts
export const search = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notes = await NoteService.searchNotes(req.query.q as string);
    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
```

Every other controller in this app catches errors and returns a generic `"Internal server error"` message (see the pattern in [A05](A05-injection.md)'s repository code, which uses the same query mechanism). This one endpoint returns `error.message` unfiltered instead — and because this is the same endpoint that already has [SQL injection](A05-injection.md), a malformed injection attempt doesn't just fail silently, it echoes back the exact query that failed.

## PoC

```bash
curl -G http://localhost:3002/notes/search \
  -H "Authorization: Bearer <token>" \
  --data-urlencode "q=' OR 1=1) UNION SELECT password FROM users --"
```

This returns:

```json
{"error":"Failed query: SELECT id, user_id, title, body, created_at FROM notes WHERE title LIKE '%' OR 1=1) UNION SELECT password FROM users --%'\nparams: "}
```

The response leaks the fully-assembled SQL query, with the attacker's own input reflected inline exactly where it landed. This is not a generic 500 — it's targeted debugging assistance: the attacker sees precisely how their payload was interpolated, how many quotes/parens are needed to close the surrounding `LIKE '%...%'`, and can iterate toward a working injection far faster than blind trial and error.

## Impact

Turns SQL injection from a guessing game into a guided one. Each failed attempt against `/notes/search` teaches the attacker the exact query shape, accelerating discovery of a working payload (see [A05](A05-injection.md) for what a successful one achieves — reading every user's notes in a single request). Beyond this specific endpoint, verbose database errors in general also risk exposing schema details (table/column names, constraint names) useful for reconnaissance even without a working injection yet.

## Planned fix

Never return raw exception messages to the client. Log the full error server-side (where [A09](A09-logging-failures.md) also applies — this app currently doesn't log much of anything) and return a generic message to the caller:

```ts
} catch (error) {
  console.error("search failed", error); // full detail stays server-side
  return res.status(500).json({ error: "Internal server error" });
}
```

## Fix applied

The per-endpoint `try/catch` with `error.message` no longer exists — `search` (like every other controller) now propagates errors to a central `errorHandler` middleware that always returns a generic `"Internal server error"` on unrecognized exceptions ([`b08e737`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/b08e737)), and that handler was later updated to `console.error` the full error server-side before responding ([`111ac3d`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/111ac3d)), matching the planned fix above.

Separately, a ZAP scan found the search endpoint still 500'd on a null-byte payload (`q=%00...`) — not the original SQLi-echo bug, but the same underlying gap: `q` reached PostgreSQL unvalidated, and the driver's rejection (`invalid byte sequence for encoding "UTF8"`) fell through to the generic 500. Fixed by validating `q` with Zod (max length, rejects `\0`) before it reaches the database ([`6eb7db4`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/6eb7db4)) — the malformed input is now rejected with 400 at the edge instead of ever reaching Postgres.

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
