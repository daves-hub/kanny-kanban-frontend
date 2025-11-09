import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/kanban";

type Props = {
  task: Task;
  children: React.ReactNode;
};

export default function DraggableTask({ task, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
    data: { taskId: task.id, listId: task.listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  // Show blue dashed placeholder when dragging
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-dashed-blue bg-blue-50/30 p-4"
      >
        <div className="h-20 opacity-0">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      {children}
    </div>
  );
}
