export type ISODateString = string;

export type User = {
  id: number;
  email: string;
  name: string | null;
  createdAt: ISODateString;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Board = {
  id: number;
  name: string;
  ownerId: number;
  projectId: number | null; // null for standalone boards
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type List = {
  id: number;
  boardId: number;
  title: string;
  position: number;
  createdAt: ISODateString;
};

export type Task = {
  id: number;
  listId: number;
  title: string;
  description: string | null;
  position: number;
  createdAt: ISODateString;
};

export type ListWithTasks = List & {
  tasks: Task[];
};

export type BoardWithLists = Board & {
  lists: ListWithTasks[];
};

export type ProjectWithBoards = Project & {
  boards: Board[];
  boardCount?: number;
};

export type EntityWithId = {
  id: number;
};
