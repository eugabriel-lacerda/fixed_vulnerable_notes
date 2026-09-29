import { z } from "zod";

export const CreateNoteSchema = z
  .object({
    title: z.string().min(1),
    body: z.string().optional(),
  })
  .strict();

export const UpdateNoteSchema = z
  .object({
    title: z.string().min(1).optional(),
    body: z.string().optional(),
  })
  .strict();

export const NoteIdSchema = z.coerce.number().int().positive().max(2147483647);

export const SearchQuerySchema = z
  .string()
  .max(200)
  .refine((value) => !value.includes("\0"), { message: "Query must not contain null bytes" })
  .optional()
  .default("");
