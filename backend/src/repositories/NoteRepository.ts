import { db } from "../database";
import { sql } from "drizzle-orm";
import { Note } from "../types/Note";

export async function findAllByUserId(userId: number): Promise<Note[]> {
  const result = await db.execute(
    sql`SELECT id, user_id, title, body, created_at FROM notes WHERE user_id = ${userId}`,
  );
  return result.rows as unknown as Note[];
}

export async function searchByTitle(query: string): Promise<Note[]> {
  const result = await db.execute(
    sql`SELECT id, user_id, title, body, created_at FROM notes WHERE title LIKE ${`%${query}%`}`,
  );
  return result.rows as unknown as Note[];
}

export async function findById(id: number): Promise<Note> {
  const result = await db.execute(
    sql`SELECT id, user_id, title, body, created_at FROM notes WHERE id = ${id}`,
  );
  return result.rows[0] as unknown as Note;
}

export async function create(title: string, body: string, userId: number): Promise<Note> {
  const result = await db.execute(
    sql`INSERT INTO notes (title, body, user_id) VALUES (${title}, ${body}, ${userId}) RETURNING *`,
  );
  return result.rows[0] as unknown as Note;
}

export async function update(id: number, title: string, body?: string): Promise<Note> {
  const result = await db.execute(
    sql`UPDATE notes SET title = ${title}, body = ${body} WHERE id = ${id} RETURNING *`,
  );
  return result.rows[0] as unknown as Note;
}

export async function remove(id: number): Promise<void> {
  await db.execute(sql`DELETE FROM notes WHERE id = ${id}`);
}
