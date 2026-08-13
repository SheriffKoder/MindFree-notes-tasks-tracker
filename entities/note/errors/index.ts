/**
 * @file entities/note/errors/index.ts
 * Public surface for note domain errors.
 *
 * File index:
 * - note-date-conflict-error — NoteDateConflictError
 * - note-stale-write-error — NoteStaleWriteError
 */

export { NoteDateConflictError } from "@/entities/note/errors/note-date-conflict-error";
export { NoteStaleWriteError } from "@/entities/note/errors/note-stale-write-error";
