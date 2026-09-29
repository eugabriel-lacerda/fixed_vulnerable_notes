# A01 — Broken Access Control

**Where:** `backend/src/repositories/NoteRepository.ts`, `backend/src/controllers/NoteController.ts`
**Flow:** Notes CRUD (`GET/PUT/DELETE /notes/:id`, `POST /notes`)

**Status:** ✅ Fixed — [`9ed1612`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/9ed1612)

---

## Part 1 — IDOR (Insecure Direct Object Reference)

`findById` fetches a note by its `id` alone, with no check on who owns it:

```ts
// backend/src/repositories/NoteRepository.ts
export async function findById(id: number): Promise<Note> {◊
  const result = await db.execute(
    sql`SELECT id, user_id, title, body, created_at FROM notes WHERE id = ${id}`,
  );
  return result.rows[0] as unknown as Note;
}
```

`NoteService.getNote`, `updateNote`, and `deleteNote` all call this same `findById` and never compare `note.user_id` against the authenticated `req.user.id`. Any logged-in user can read, edit, or delete any other user's note just by knowing its `id` — the JWT proves *who you are*, but nothing here checks *what you're allowed to touch*.

This is made worse by the notes table using sequential integer ids (`serial`, see `backend/src/database/schema.ts`) instead of UUIDs — ids are trivially enumerable (1, 2, 3...), so an attacker doesn't even need to leak an id from elsewhere, just iterate.

### PoC

```bash
# Attacker logs in as their own account (user id 7, say)
curl -s -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"attacker@test.com","password":"123456"}'
# → { "token": "..." }

# Reads someone else's note just by guessing a sequential id
curl -s http://localhost:3002/notes/6 \
  -H "Authorization: Bearer <attacker_token>"
# → returns the victim's note in full, despite not owning it

# Deletes it too — same missing check
curl -s -X DELETE http://localhost:3002/notes/6 \
  -H "Authorization: Bearer <attacker_token>"
# → 204, note gone
```

### Impact

Complete loss of confidentiality and integrity for all notes in the system — any authenticated user can read, modify, or delete any other user's private notes, not just their own.

### Planned fix

Every query that fetches a note by id must also scope by the authenticated user:

```ts
sql`SELECT * FROM notes WHERE id = ${id} AND user_id = ${authenticatedUserId}`
```

If the row comes back empty, return 404 (not 403) — don't reveal whether the note exists for another user.

---

## Part 2 — Mass Assignment / Overposting

`POST /notes` accepts a `user_id` field straight from the request body and uses it instead of the authenticated user's own id:

```ts
// backend/src/controllers/NoteController.ts
export const create = async (req: AuthenticatedRequest, res: Response) => {
  const { title, body, user_id } = req.body;
  const userId = user_id ?? req.user!.id;
  // ...
  const note = await NoteService.createNote(title, body, userId);
```

A properly authenticated user can create a note under someone else's account just by adding one extra field to the JSON body. The `?? req.user!.id` fallback looks like a safe default at a glance, but it means the client-supplied value always wins when present — the opposite of what a fallback should do.

### PoC

```bash
# Attacker is authenticated as their own account, but forges a note as user 2
curl -s -X POST http://localhost:3002/notes \
  -H "Authorization: Bearer <attacker_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Not mine","body":"attacker payload","user_id":2}'
# → { "id": ..., "user_id": 2, "title": "Not mine", ... }
```

### Impact

An attacker can plant fabricated content under another user's account — relevant for framing (planting incriminating or spammy notes), for polluting another user's data, or as a stepping stone for other attacks (e.g. stored XSS delivered via a note the victim didn't write).

### Planned fix

Never trust a client-supplied `user_id` for a value that should only ever come from the authenticated session. Explicit schema validation (Zod, with `.strict()`) rejects any undeclared field like `user_id` outright, and the real value is taken exclusively from `req.user.id`:

```ts
const userId = req.user!.id; // never read from req.body
```

---

## Fix applied

Both parts fixed in [`9ed1612`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/9ed1612):
- Every note query (`findById`, `searchByTitle`, `update`, `remove`) now scopes by `user_id`. A note that isn't the caller's returns 404, matching the "don't reveal existence" guidance above.
- `POST /notes` no longer reads `user_id` from the body. `CreateNoteSchema` is `.strict()` (Zod), rejecting the field outright with a 400 instead of silently accepting it.

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/)
