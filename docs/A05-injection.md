# A05 — Injection

This category covers two unrelated vulnerabilities in this app: SQL Injection on the backend (note search) and stored XSS on the frontend (note body rendering). Different mechanisms, same OWASP category.

---

## Part 1 — SQL Injection

**Where:** `backend/src/repositories/NoteRepository.ts`
**Flow:** Note search (`GET /notes/search?q=`)

## Context

The search endpoint builds its SQL by concatenating the raw query string into a `LIKE` clause, instead of parameterizing it:

```ts
// backend/src/repositories/NoteRepository.ts
export async function searchByTitle(query: string): Promise<Note[]> {
  const result = await db.execute(
    sql.raw(`SELECT id, user_id, title, body, created_at FROM notes WHERE title LIKE '%${query}%'`),
  );
  return result.rows as unknown as Note[];
}
```

`sql.raw()` is Drizzle's escape hatch out of parameterized queries — everywhere else in this codebase, `sql\`...\`` with template interpolation is used, which binds values as real query parameters (see [A01](A01-broken-access-control.md)'s and the auth repository's queries for the safe pattern). Here, the search query goes through `sql.raw()` with plain string interpolation instead, so anything the client sends in `q` becomes literal SQL.

This is also missing the ownership filter that `findAllByUserId` has — search results aren't scoped to the authenticated user at all, so even a syntactically valid, non-malicious search can return other users' notes. The injection just makes that worse.

## PoC

A normal search:

```bash
curl -s -G http://localhost:3002/notes/search \
  -H "Authorization: Bearer <token>" \
  --data-urlencode "q=Grocery"
```

The injection, closing the `LIKE` pattern and appending an always-true condition:

```bash
curl -s -G http://localhost:3002/notes/search \
  -H "Authorization: Bearer <token>" \
  --data-urlencode "q=x% OR 1=1 --"
```

This resolves to:

```sql
SELECT id, user_id, title, body, created_at FROM notes WHERE title LIKE '%x%' OR 1=1 --%'
```

The `--` comments out the trailing `%'`, and `OR 1=1` makes every row match regardless of title. Verified during development: an authenticated user with zero notes of their own got back every note in the table, across every user, from a single request.

A naive `' OR '1'='1` (the textbook SQLi payload) does **not** work here — the surrounding `LIKE '%...%'` means the injected `'1'='1'` needs to close the `LIKE` pattern correctly and use a numeric/boolean condition (`OR 1=1`) rather than a string comparison, or it silently fails to match anything. This is a useful detail for the writeup: the classic payload doesn't always transfer directly, the injection has to fit the exact SQL shape it's landing in.

## Impact

Full read access to the `notes` table regardless of ownership, bypassing authentication-based access control entirely for this endpoint. With a more privileged database user or a richer schema, the same class of bug enables writing (`UPDATE`/`DELETE` via stacked queries, depending on driver support) or reading from other tables entirely (`UNION SELECT` against `users`, exposing password hashes).

## Planned fix

Parameterize the query instead of interpolating into raw SQL:

```ts
sql`SELECT id, user_id, title, body, created_at FROM notes WHERE title LIKE ${'%' + query + '%'}`
```

The `%` wildcards are built in JS and passed as a single bound parameter, so the driver escapes the value correctly no matter what it contains. Also add the missing `user_id` filter, so search results are scoped to the authenticated user like the rest of the notes endpoints.

---

## Part 2 — Stored XSS

**Where:** `frontend/src/pages/note-detail/index.tsx`
**Flow:** Viewing a note (`GET /notes/:id` → rendered on `/notes/:id`)

The note body is rendered with `dangerouslySetInnerHTML`, with no sanitization of what the backend returns:

```tsx
// frontend/src/pages/note-detail/index.tsx
<div
  className="font-sans text-[15px] leading-relaxed text-ink"
  dangerouslySetInnerHTML={{ __html: body }}
/>
```

`body` comes straight from the API response (the note's stored content), and the backend doesn't validate or sanitize it on the way in either (see [A08](A08-integrity-failures.md) for the same "trust the client's input" pattern in the same feature). Whatever HTML a user types into the note body gets parsed and rendered as real DOM the next time anyone views that note — including a different user, if [A01](A01-broken-access-control.md)'s IDOR is used to open a note that isn't theirs.

### PoC

1. Log in, create a new note.
2. In the body field, enter:
   ```html
   <img src=x onerror="alert('XSS: ' + document.cookie)">
   ```
3. Save. The app redirects to the note's view mode.
4. The `onerror` handler fires immediately — a JavaScript `alert()` pops up, no interaction needed beyond opening the note.

Verified during development: the payload above executes exactly as expected the moment the note is viewed. Note that a naive `<script>alert(1)</script>` payload does **not** fire — `innerHTML` (which `dangerouslySetInnerHTML` uses under the hood) strips `<script>` tags entirely per the DOM spec, so the practical payload is always an event handler on a real element (`onerror`, `onload`, `onclick`, etc.), not a `<script>` tag. Worth noting in a writeup: the textbook `<script>` payload is the one people picture, but it's actually one of the least likely to work in a browser-rendered `innerHTML` sink.

### Impact

Full stored XSS: any JavaScript an attacker plants in a note body executes in the browser of every user who later views that note, with the same access as that user's session (their `localStorage`, including the JWT — see the note about `localStorage` + XSS risk in `frontend/scope.md`). Combined with A01's IDOR, an attacker doesn't even need the victim to visit a link — they can plant the payload in their own note, then use IDOR to guess/iterate note IDs, and any note ID that happens to belong to another user still renders the same malicious body when the attacker views it (self-XSS becomes stored XSS against anyone who opens that note, attacker included, but the real danger is when a legitimate user opens their own note and it's had a payload planted into it via some other overposting/IDOR combination on write).

### Planned fix

Sanitize before rendering, never trust stored content as safe HTML just because it came from your own backend:

```tsx
import DOMPurify from "dompurify";

<div
  className="font-sans text-[15px] leading-relaxed text-ink"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
/>
```

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
