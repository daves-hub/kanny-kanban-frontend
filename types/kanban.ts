import { z } from "zod";

export type ISODateString = string;

const isoDateString = z.string();

export const UserSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    name: z.string().nullable(),
    createdAt: isoDateString,
  })
  .passthrough();
export type User = z.infer<typeof UserSchema>;

export const BoardSummarySchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .passthrough();
export type BoardSummary = z.infer<typeof BoardSummarySchema>;

export const BoardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    ownerId: z.number(),
    projectId: z.number().nullable(),
    createdAt: isoDateString,
    updatedAt: isoDateString,
  })
  .passthrough();
export type Board = z.infer<typeof BoardSchema>;

export const ProjectBoardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    ownerId: z.number().optional(),
    projectId: z.number().nullable().optional(),
    createdAt: isoDateString.optional(),
    updatedAt: isoDateString.optional(),
  })
  .passthrough();
export type ProjectBoard = z.infer<typeof ProjectBoardSchema>;

export const ListSchema = z
  .object({
    id: z.number(),
    boardId: z.number(),
    title: z.string(),
    position: z.number(),
    createdAt: isoDateString,
  })
  .passthrough();
export type List = z.infer<typeof ListSchema>;

export const TaskSchema = z
  .object({
    id: z.number(),
    listId: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    position: z.number(),
    createdAt: isoDateString,
  })
  .passthrough();
export type Task = z.infer<typeof TaskSchema>;

export const ListWithTasksSchema = ListSchema.extend({
  tasks: z.array(TaskSchema).default([]),
});
export type ListWithTasks = z.infer<typeof ListWithTasksSchema>;

export const BoardWithListsSchema = BoardSchema.extend({
  lists: z.array(ListWithTasksSchema).default([]),
});
export type BoardWithLists = z.infer<typeof BoardWithListsSchema>;

export const ProjectSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    ownerId: z.number(),
    createdAt: isoDateString,
    updatedAt: isoDateString,
    boards: z.array(BoardSummarySchema).optional(),
  })
  .passthrough();
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectWithBoardsSchema = ProjectSchema.extend({
  boards: z.array(ProjectBoardSchema).default([]),
});
export type ProjectWithBoards = z.infer<typeof ProjectWithBoardsSchema>;

export const ProjectsResponseSchema = z.array(ProjectSchema);
export const BoardsResponseSchema = z.array(BoardSchema);
export const ListsResponseSchema = z.array(ListSchema);
export const TasksResponseSchema = z.array(TaskSchema);

export type EntityWithId = {
  id: number;
};
