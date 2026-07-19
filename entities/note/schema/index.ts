/**
 * @file entities/note/schema/index.ts
 * Public surface for note write contracts (Zod).
 *
 * File index:
 * - create-note.schema — calendar/general create bodies + response
 * - update-note.schema — PATCH body + response
 */

export {
  createCalendarNoteBodySchema,
  createGeneralNoteBodySchema,
  createNoteResponseSchema,
} from "@/entities/note/schema/create-note.schema";
export type {
  CreateCalendarNoteBody,
  CreateGeneralNoteBody,
  CreateNoteResponse,
} from "@/entities/note/schema/create-note.schema";
export {
  updateNoteBodySchema,
  updateNoteResponseSchema,
} from "@/entities/note/schema/update-note.schema";
export type {
  UpdateNoteBody,
  UpdateNoteResponse,
} from "@/entities/note/schema/update-note.schema";
