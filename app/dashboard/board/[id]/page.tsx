"use client";

import { useState, use, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { Task, BoardWithLists, ListWithTasks } from "@/types/kanban";
import { KanbanColumn } from "@/components/kanban-column";
import TaskCard from "@/components/task-card";
import DraggableTask from "@/components/draggable-task";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AddTaskModal } from "@/components/add-task-modal";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { DeleteColumn } from "@/components/delete-column";
import { DragProvider } from "@/contexts/drag-context";
import { boardService } from "@/services/boards.service";
import { listService } from "@/services/lists.service";
import { taskService } from "@/services/tasks.service";
import { projectService } from "@/services/projects.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type BoardPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = use(params);
  const boardId = parseInt(id);
  
  const [board, setBoard] = useState<BoardWithLists | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [addingToListId, setAddingToListId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [collapsedLists, setCollapsedLists] = useState<Set<number>>(new Set());
  const [isMobileView, setIsMobileView] = useState(false);
  const wasMobileRef = useRef<boolean | null>(null);

  // Fetch board data
  useEffect(() => {
    let isMounted = true;

    const fetchBoard = async () => {
      setProjectName(null);
      try {
        const boardData = await boardService.getById(boardId);

        let listsWithTasks: ListWithTasks[] = [];

        let fetchedProjectName: string | null = null;
        if (boardData.projectId) {
          try {
            const project = await projectService.getById(boardData.projectId);
            fetchedProjectName = project.name;
          } catch (projectError) {
            console.error("Failed to fetch project for board:", projectError);
          }
        }

        if (Array.isArray(boardData.lists)) {
          listsWithTasks = await Promise.all(
            boardData.lists.map(async (list) => {
              if (Array.isArray(list.tasks)) {
                return { ...list, tasks: list.tasks };
              }

              try {
                const listTasks = await taskService.getAllByList(list.id);
                return { ...list, tasks: listTasks };
              } catch (taskError) {
                console.error(`Failed to fetch tasks for list ${list.id}:`, taskError);
                return { ...list, tasks: [] };
              }
            })
          );
        } else {
          try {
            const lists = await listService.getAllByBoard(boardId);
            listsWithTasks = await Promise.all(
              lists.map(async (list) => {
                try {
                  const listTasks = await taskService.getAllByList(list.id);
                  return { ...list, tasks: listTasks };
                } catch (taskError) {
                  console.error(`Failed to fetch tasks for list ${list.id}:`, taskError);
                  return { ...list, tasks: [] };
                }
              })
            );
          } catch (listError) {
            console.error("Failed to fetch lists:", listError);
          }
        }

        const sortedLists = listsWithTasks
          .map((list) => ({ ...list, tasks: Array.isArray(list.tasks) ? list.tasks : [] }))
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        if (isMounted) {
          setBoard({ ...boardData, lists: sortedLists });
          setProjectName(fetchedProjectName);
        }
      } catch (error) {
        console.error("Failed to fetch board:", error);
        if (isMounted) {
          setBoard(null);
          setProjectName(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBoard();

    return () => {
      isMounted = false;
    };
  }, [boardId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const lists = useMemo(
    () => (board?.lists ?? []).filter(Boolean) as ListWithTasks[],
    [board]
  );

  useEffect(() => {
    if (board === null) {
      setCollapsedLists(new Set());
    }
  }, [board]);

  useEffect(() => {
    const previouslyMobile = wasMobileRef.current;
    if (isMobileView && !previouslyMobile) {
      setCollapsedLists(new Set(lists.map((list) => list.id)));
    }
    if (!isMobileView && previouslyMobile) {
      setCollapsedLists(new Set());
    }
    wasMobileRef.current = isMobileView;
  }, [isMobileView, lists]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-600">Board not found</p>
      </div>
    );
  }

  const tasks = lists.flatMap((list) => list.tasks ?? []);

  const toggleListCollapse = (listId: number) => {
    setCollapsedLists((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const handleAddTask = async (listId: number, title: string, description: string) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;

      const position = list.tasks.length;
      const newTask = await taskService.create(listId, { title, description, position });
      
      // Update local state
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map(l =>
            l.id === listId
              ? { ...l, tasks: [...l.tasks, newTask] }
              : l
          ),
        };
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    try {
      await taskService.update(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description || undefined,
      });
      
      // Update local state
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map(l => ({
            ...l,
            tasks: l.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
          })),
        };
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete || isDeletingTask) return;
    const deletingTaskId = taskToDelete.id;
    setIsDeletingTask(true);

    try {
      await taskService.delete(deletingTaskId);
      
      // Update local state after a successful deletion
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map(l => ({
            ...l,
            tasks: l.tasks.filter(t => t.id !== deletingTaskId),
          })),
        };
      });
      setTaskToDelete(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    try {
      const list = lists.find(l => l.id === task.listId);
      if (!list) return;

      const position = list.tasks.length;
      const newTask = await taskService.create(task.listId, {
        title: `${task.title} (copy)`,
        description: task.description || undefined,
        position,
      });
      
      // Update local state
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map(l =>
            l.id === task.listId
              ? { ...l, tasks: [...l.tasks, newTask] }
              : l
          ),
        };
      });
    } catch (error) {
      console.error("Failed to duplicate task:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeMatch = String(active.id).match(/^task-(\d+)$/);
    if (!activeMatch) return;
    const taskId = Number(activeMatch[1]);
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);
    
    if (!over || active.id === over.id) return;

    const activeMatch = String(active.id).match(/^task-(\d+)$/);
    if (!activeMatch) return;
    const activeTaskId = Number(activeMatch[1]);

    const activeTaskObj = tasks.find((t) => t.id === activeTaskId);
    if (!activeTaskObj) return;

    // Check if dropped on delete zone
    if (over.id === "delete-zone") {
      setTaskToDelete(activeTaskObj);
      return;
    }

    // Determine target list and position
    let targetListId: number;
    let targetIndex: number;

    const overStr = String(over.id);
    const overListMatch = overStr.match(/^list-(\d+)$/);
    const overTaskMatch = overStr.match(/^task-(\d+)$/);

    if (overListMatch) {
      // Dropped on empty column or column background
      targetListId = Number(overListMatch[1]);
      const targetList = lists.find(l => l.id === targetListId);
      const targetListTasks = targetList?.tasks.filter((t) => t.id !== activeTaskId) || [];
      targetIndex = targetListTasks.length;
    } else if (overTaskMatch) {
      // Dropped on another task
      const overTaskId = Number(overTaskMatch[1]);
      const overTask = tasks.find((t) => t.id === overTaskId);
      if (!overTask) return;
      
      targetListId = overTask.listId;
      const listObj = lists.find(l => l.id === targetListId);
      const listTasks = listObj?.tasks || [];
      const oldIndex = listTasks.findIndex((t) => t.id === activeTaskId);
      const newIndex = listTasks.findIndex((t) => t.id === overTaskId);

      if (activeTaskObj.listId === targetListId) {
        // Same column reordering
        const reordered = arrayMove(listTasks, oldIndex, newIndex);
        
        // Update positions in backend
        try {
          const updatePromises = reordered.map((task, idx) => 
            taskService.update(task.id, { position: idx })
          );
          await Promise.all(updatePromises);
          
          // Update local state
          setBoard(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              lists: prev.lists.map(l =>
                l.id === targetListId
                  ? { ...l, tasks: reordered.map((t, idx) => ({ ...t, position: idx })) }
                  : l
              ),
            };
          });
        } catch (error) {
          console.error("Failed to reorder tasks:", error);
        }
        return;
      } else {
        // Cross-column move
        targetIndex = newIndex;
      }
    } else {
      return;
    }

    // Handle cross-column move
    try {
      await taskService.update(activeTaskId, {
        listId: targetListId,
        position: targetIndex,
      });
      
      // Update local state
      setBoard(prev => {
        if (!prev) return prev;
        
        const sourceList = prev.lists.find(l => l.id === activeTaskObj.listId);
        const targetList = prev.lists.find(l => l.id === targetListId);
        
        if (!sourceList || !targetList) return prev;
        
        // Remove from source
        const updatedSourceTasks = sourceList.tasks
          .filter(t => t.id !== activeTaskId)
          .map((t, idx) => ({ ...t, position: idx }));
        
        // Add to target
        const movedTask = { ...activeTaskObj, listId: targetListId, position: targetIndex };
        const updatedTargetTasks = [
          ...targetList.tasks.slice(0, targetIndex),
          movedTask,
          ...targetList.tasks.slice(targetIndex),
        ].map((t, idx) => ({ ...t, position: idx }));
        
        return {
          ...prev,
          lists: prev.lists.map(l => {
            if (l.id === activeTaskObj.listId) {
              return { ...l, tasks: updatedSourceTasks };
            }
            if (l.id === targetListId) {
              return { ...l, tasks: updatedTargetTasks };
            }
            return l;
          }),
        };
      });
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

  const projectId = typeof board.projectId === "number" ? board.projectId : null;
  const hasProject = projectId !== null;
  const showProjectInfo = hasProject && Boolean(projectName);

  return (
    <DragProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 flex-col">
          <header className="border-b bg-white px-6 py-3">
            <div className="flex items-center gap-3">
              {hasProject && projectId !== null ? (
                <Link href={`/dashboard/projects/${projectId}`}>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ArrowLeft className="size-5" />
                    <span className="sr-only">Back to project</span>
                  </Button>
                </Link>
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <h1 className="truncate text-xl font-semibold text-gray-900">{board.name}</h1>
                  {showProjectInfo && projectId !== null ? (
                    <>
                      <span aria-hidden className="text-gray-300">•</span>
                      <Link
                        href={`/dashboard/projects/${projectId}`}
                        className="truncate text-sm text-gray-500 hover:text-gray-700"
                      >
                        {projectName}
                      </Link>
                    </>
                  ) : null}
                </div>
                {hasProject ? (
                  <p className="truncate text-xs text-gray-500">Project board</p>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-none md:grid-flow-col md:auto-cols-[minmax(280px,1fr)] md:grid-rows-2">
              {lists.map((list) => {
                const listTasks = (list.tasks ?? []).filter((task): task is Task => Boolean(task));
                const isAdding = addingToListId === list.id;
                const isCollapsed = collapsedLists.has(list.id);

                // Check if this column is being dragged over
                let isDraggingOver = false;
                if (overId) {
                  const overListMatch = overId.match(/^list-(\d+)$/);
                  if (overListMatch && Number(overListMatch[1]) === list.id) {
                    isDraggingOver = true;
                  } else {
                    const overTaskMatch = overId.match(/^task-(\d+)$/);
                    if (overTaskMatch) {
                      const overTaskId = Number(overTaskMatch[1]);
                      const overTask = tasks.find((t) => t.id === overTaskId);
                      if (overTask && overTask.listId === list.id) {
                        isDraggingOver = true;
                      }
                    }
                  }
                }

                return (
                  <KanbanColumn
                    key={list.id}
                    list={list}
                    tasks={listTasks}
                    onAddTask={(listId) => setAddingToListId(listId)}
                    onEditTask={handleEditTask}
                    onDeleteTask={(task) => setTaskToDelete(task)}
                    isDraggingOver={isDraggingOver}
                    collapsed={isCollapsed}
                    onToggleCollapse={toggleListCollapse}
                  >
                    {listTasks.map((task) => (
                      <DraggableTask key={task.id} task={task}>
                        <TaskCard
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={(task) => setTaskToDelete(task)}
                          onDuplicate={handleDuplicateTask}
                          isHighlighted={task.id === taskToDelete?.id}
                        />
                      </DraggableTask>
                    ))}

                    {isAdding && (
                      <AddTaskModal
                        listId={list.id}
                        onAdd={(title, description) => {
                          handleAddTask(list.id, title, description);
                          setAddingToListId(null);
                        }}
                        onClose={() => setAddingToListId(null)}
                      />
                    )}
                  </KanbanColumn>
                );
              })}

              {/* Delete Column */}
              <DeleteColumn isDraggingOver={overId === "delete-zone"} />
            </div>
          </main>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          task={taskToDelete}
          open={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDeleteTask}
          isDeleting={isDeletingTask}
        />

        {/* Drag Overlay - follows mouse cursor */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="cursor-grabbing">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragProvider>
  );
}
