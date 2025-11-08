"use client";

import { useState } from "react";
import type { Task, List } from "@/types/kanban";
import { KanbanColumn } from "@/components/kanban-column";
import TaskCard from "@/components/task-card";
import DraggableTask from "@/components/draggable-task";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AddTaskModal } from "@/components/add-task-modal";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { DeleteColumn } from "@/components/delete-column";
import { DragProvider } from "@/contexts/drag-context";

// Mock data for demonstration
const initialLists: List[] = [
  {
    id: 1,
    boardId: 1,
    title: "Todo",
    position: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    boardId: 1,
    title: "In Progress",
    position: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    boardId: 1,
    title: "Completed",
    position: 2,
    createdAt: new Date().toISOString(),
  },
];

const initialTasks: Task[] = [
  {
    id: 1,
    listId: 1,
    title: "Task title",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    position: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    listId: 2,
    title: "Task title",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    position: 0,
    createdAt: new Date().toISOString(),
  },
];

export default function BoardPage() {
  const [lists] = useState<List[]>(initialLists);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [addingToListId, setAddingToListId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleAddTask = (listId: number, title: string, description: string) => {
    const newTask: Task = {
      id: Date.now(),
      listId,
      title,
      description,
      position: tasks.filter((t) => t.listId === listId).length,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const handleEditTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const handleDuplicateTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      title: `${task.title} (copy)`,
      position: tasks.filter((t) => t.listId === task.listId).length,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const sensors = useSensors(useSensor(PointerSensor));

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);
    
    if (!over || active.id === over.id) return;

    const activeMatch = String(active.id).match(/^task-(\d+)$/);
    if (!activeMatch) return;
    const activeTaskId = Number(activeMatch[1]);

    const activeTask = tasks.find((t) => t.id === activeTaskId);
    if (!activeTask) return;

    // Check if dropped on delete zone
    if (over.id === "delete-zone") {
      setTaskToDelete(activeTask);
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
      const targetListTasks = tasks.filter((t) => t.listId === targetListId && t.id !== activeTaskId);
      targetIndex = targetListTasks.length;
    } else if (overTaskMatch) {
      // Dropped on another task
      const overTaskId = Number(overTaskMatch[1]);
      const overTask = tasks.find((t) => t.id === overTaskId);
      if (!overTask) return;
      
      targetListId = overTask.listId;
      const listTasks = tasks.filter((t) => t.listId === targetListId);
      const oldIndex = listTasks.findIndex((t) => t.id === activeTaskId);
      const newIndex = listTasks.findIndex((t) => t.id === overTaskId);

      if (activeTask.listId === targetListId) {
        // Same column reordering
        const reordered = arrayMove(listTasks, oldIndex, newIndex);
        setTasks((prev) => {
          const otherTasks = prev.filter((t) => t.listId !== targetListId);
          return [
            ...otherTasks,
            ...reordered.map((t, idx) => ({ ...t, position: idx })),
          ];
        });
        return;
      } else {
        // Cross-column move
        targetIndex = newIndex;
      }
    } else {
      return;
    }

    // Handle cross-column move
    setTasks((prev) => {
      const updatedTasks = prev.map((t) => {
        if (t.id === activeTaskId) {
          return { ...t, listId: targetListId, position: targetIndex };
        }
        // Adjust positions in source list
        if (t.listId === activeTask.listId && t.position > activeTask.position) {
          return { ...t, position: t.position - 1 };
        }
        // Adjust positions in target list
        if (t.listId === targetListId && t.position >= targetIndex) {
          return { ...t, position: t.position + 1 };
        }
        return t;
      });
      return updatedTasks;
    });
  };

  return (
    <DragProvider>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6">
            {lists.map((list) => {
              const listTasks = tasks.filter((t) => t.listId === list.id);
              const isAdding = addingToListId === list.id;
              
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        task={taskToDelete}
        open={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
      />

      {/* Drag Overlay - follows mouse cursor */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-3 cursor-grabbing">
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
