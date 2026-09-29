# A08 — Software/Data Integrity Failures

**Where:** `backend/src/controllers/NoteController.ts`, `backend/src/services/NoteService.ts`
**Flow:** Note update (`PUT /notes/:id`)

**Status:** ✅ Fixed — [`b08e737`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/b08e737)

As originally implemented, this was the classic anti-pattern with narrower impact than the textbook version — see "Why this doesn't fully pollute `Object.prototype`" below. Documented anyway because the code smell and its real-world equivalent (deep-merge libraries) are exactly what causes this bug in production.

---

## Context

The update endpoint takes the entire request body and merges it directly into the existing note object, with no schema validation and no allow-list of fields:

```ts
// backend/src/controllers/NoteController.ts
export const update = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const note = await NoteService.updateNote(Number(req.params.id), req.body);
    // ...
```

```ts
// backend/src/services/NoteService.ts
export async function updateNote(id: number, updates: Record<string, unknown>) {
  const note = await NoteRepository.findById(id);
  // ...
  const merged = Object.assign(note, updates);
  return NoteRepository.update(id, merged.title, merged.body);
}
```

The client's JSON is merged wholesale into a real object from the system (`note`, fetched from the database) — the textbook setup for prototype pollution: attacker-controlled input reaching an unguarded merge.

## PoC (and what it actually does)

```bash
curl -X PUT http://localhost:3002/notes/10 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","body":"after","__proto__":{"isAdmin":true}}'
```

The request succeeds (200, note updated) and the extra `__proto__` key is silently accepted with no validation error — confirming the endpoint has no schema enforcement at all.

**What was verified during development:** on the current Node/V8 runtime, `Object.assign(target, source)` where `source` came from `JSON.parse(...)` does **not** pollute the global `Object.prototype`. `JSON.parse` produces `"__proto__"` as a literal own property (not a special accessor), and while `Object.assign` does invoke the inherited `__proto__` setter for it, that setter only reassigns the prototype of `target` itself — not the shared `Object.prototype`. Confirmed directly:

```js
const target = {};
Object.assign(target, JSON.parse('{"__proto__":{"isAdmin":true}}'));
Object.getPrototypeOf(target) === Object.prototype; // false — target's own prototype changed
Object.prototype.isAdmin; // undefined — global prototype untouched
```

So this specific one-level `Object.assign` pattern does not reproduce the classic "every object in the app is now polluted" impact by itself in a modern engine — modern V8 closed that specific gap.

## Why this still matters

The real-world CVEs this category refers to (`lodash` `_.merge`, `minimist`, and others) don't use `Object.assign` — they use **recursive/deep merge**, which walks into nested objects and can reach the prototype chain through paths like `constructor.prototype`, not just a bare `__proto__` key. Verified separately: a small recursive merge function reproduces true global pollution with a `constructor.prototype` payload, while the shallow `Object.assign` used in this codebase does not.

The code here is still the exact anti-pattern that causes the real vulnerability — merging unfiltered client input into an internal object — it's just that this specific endpoint's merge is shallow (one level), which happens to fall short of the full exploit chain on a modern runtime. In a codebase that later adds a deep-merge dependency (a very common thing to reach for — "let's `npm install` a merge helper instead of writing field-by-field code"), or on an older/different JS engine, the exact same `updateNote` code becomes fully exploitable without changing a single line of this file.

## Impact

As implemented: the endpoint accepts and silently merges arbitrary unvalidated fields into the note object with no schema enforcement — a real bug (schema/overposting failure) independent of whether full prototype pollution is achievable here. If this same merge pattern is combined with a deep-merge utility (lodash, or a hand-rolled recursive merge), it escalates to full `Object.prototype` pollution, which is a severity-critical, app-wide impact: DoS, auth bypass, or RCE depending on what "gadget" downstream code reads from a polluted property.

## Planned fix

Validate the request body against an explicit schema (Zod, `.strict()`) before touching any internal object, and never merge external JSON into an existing object — assign known fields individually instead:

```ts
const { title, body } = NoteUpdateSchema.parse(req.body);
```

## Fix applied

Implemented as planned in [`b08e737`](https://github.com/eugabriel-lacerda/fixed_vulnerable_notes/commit/b08e737): `UpdateNoteSchema` (Zod, `.strict()`) rejects any field outside `{title, body}` with a 400, and `NoteService.updateNote` no longer calls `Object.assign` — it reads `updates.title`/`updates.body` individually. The `__proto__` PoC from above now returns 400 before reaching the service layer at all.

---

**Reference:** [OWASP Top 10:2025](https://owasp.org/Top10/) · [OWASP Prototype Pollution Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html)
