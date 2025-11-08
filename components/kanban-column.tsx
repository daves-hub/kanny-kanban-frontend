import type { List, Task } from "@/types/kanban";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type KanbanColumnProps = {
  list: List;
  tasks: Task[];
  onAddTask: (listId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  children?: React.ReactNode;
  isOver?: boolean;
  isDraggingOver?: boolean;
};

const statusColors = {
  todo: "bg-gray-900",
  "in-progress": "bg-orange-500",
  completed: "bg-green-500",
} as const;

function getStatusColor(title: string): string {
  const normalized = title.toLowerCase().replace(/\s+/g, "-");
  if (normalized.includes("progress")) return statusColors["in-progress"];
  if (normalized.includes("complete") || normalized.includes("done"))
    return statusColors.completed;
  return statusColors.todo;
}

export function KanbanColumn({
  list,
  tasks,
  onAddTask,
  children,
  isDraggingOver = false,
}: KanbanColumnProps) {
  const dotColor = getStatusColor(list.title);
  const { setNodeRef, isOver } = useDroppable({ id: `list-${list.id}` });
  const taskIds = tasks.map((task) => `task-${task.id}`);
  
  const showPlaceholder = isDraggingOver && tasks.length === 0;

  return (
    <div ref={setNodeRef} className="border-dashed-neutral flex min-w-[300px] max-w-[320px] flex-col bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("size-3 rounded-full", dotColor)} />
          <h3 className="text-base font-black text-gray-600">{list.title}</h3>
        </div>
        <span className="text-sm font-bold text-gray-400">{tasks.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {children}
          {showPlaceholder && (
            <div className="border-dashed-blue bg-blue-50/30 p-4">
              <div className="h-20 opacity-0" />
            </div>
          )}
        </SortableContext>

        <button
          onClick={() => onAddTask(list.id)}
          className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <Plus className="size-4" />
          Add card
        </button>
      </div>
    </div>
  );
}
