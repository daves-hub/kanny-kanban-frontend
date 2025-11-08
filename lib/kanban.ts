import type {
  Board,
  BoardWithLists,
  EntityWithId,
  List,
  ListWithTasks,
  Task,
} from "@/types/kanban";

export function sortByPosition<T extends { position: number }>(items: Iterable<T>): T[] {
  return Array.from(items).sort((a, b) => a.position - b.position);
}

export function indexById<T extends EntityWithId>(items: Iterable<T>): Record<number, T> {
  return Array.from(items).reduce<Record<number, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

function groupTasksByList(tasks: Iterable<Task>): Record<number, Task[]> {
  return Array.from(tasks).reduce<Record<number, Task[]>>((acc, task) => {
    if (!acc[task.listId]) {
      acc[task.listId] = [];
    }

    acc[task.listId].push(task);
    return acc;
  }, {});
}

export function attachTasksToLists(lists: Iterable<List>, tasks: Iterable<Task>): ListWithTasks[] {
  const listsArray = sortByPosition(lists);
  const tasksByList = groupTasksByList(tasks);

  return listsArray.map((list) => ({
    ...list,
    tasks: sortByPosition(tasksByList[list.id] ?? []),
  }));
}

export function attachListsToBoard(board: Board, lists: Iterable<List>, tasks: Iterable<Task>): BoardWithLists {
  const boardLists = Array.from(lists).filter((list) => list.boardId === board.id);
  const listIds = new Set(boardLists.map((list) => list.id));
  const boardTasks = Array.from(tasks).filter((task) => listIds.has(task.listId));

  return {
    ...board,
    lists: attachTasksToLists(boardLists, boardTasks),
  };
}

export function attachListsToBoards(
  boards: Iterable<Board>,
  lists: Iterable<List>,
  tasks: Iterable<Task>,
): BoardWithLists[] {
  const listsArray = Array.from(lists);
  const tasksArray = Array.from(tasks);

  return Array.from(boards).map((board) =>
    attachListsToBoard(board, listsArray, tasksArray),
  );
}
