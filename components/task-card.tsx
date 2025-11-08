import type { Task } from "@/types/kanban";
import { Edit2, Copy } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
  isHighlighted?: boolean;
};

export default function TaskCard({
  task,
  onEdit,
  onDuplicate,
  isHighlighted,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onEdit({ ...task, title: editedTitle });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isHighlighted && "ring-2 ring-red-400"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {isEditing ? (
          <div className="flex-1 space-y-3">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-10 rounded-full border-blue-400 text-sm"
              autoFocus
            />
          </div>
        ) : (
          <h4
            className={cn(
              "flex-1 text-sm font-bold",
              isEditing && "text-blue-600"
            )}
          >
            {task.title}
          </h4>
        )}

        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
            aria-label="Edit task"
          >
            <Edit2 className="size-4 text-gray-600" />
          </button>
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(task);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
              aria-label="Duplicate task"
            >
              <Copy className="size-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p
          className={cn(
            "mt-3 text-xs leading-relaxed text-gray-600",
            isEditing && "text-blue-500"
          )}
        >
          {task.description}
        </p>
      )}
    </div>
  );
}
