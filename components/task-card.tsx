import type { Task } from "@/types/kanban";
import { Edit2, Copy } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  const [editedDescription, setEditedDescription] = useState(task.description ?? "");

  useEffect(() => {
    const nextTitle = task.title;
    const nextDescription = task.description ?? "";
    startTransition(() => {
      setEditedTitle(nextTitle);
      setEditedDescription(nextDescription);
    });
  }, [task]);

  const resetEdits = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description ?? "");
  };

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (!trimmedTitle) {
      resetEdits();
      setIsEditing(false);
      return;
    }

    const nextDescription = editedDescription.trim();

    onEdit({
      ...task,
      title: trimmedTitle,
      description: nextDescription ? nextDescription : null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetEdits();
    setIsEditing(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSave();
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        "group rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isHighlighted && "ring-2 ring-red-400"
      )}
    >
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Input
            value={editedTitle}
            onChange={(event) => setEditedTitle(event.target.value)}
            className="h-10 rounded-full border-blue-400 text-sm"
            autoFocus
          />
          <Textarea
            value={editedDescription}
            onChange={(event) => setEditedDescription(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            className="min-h-[120px] resize-y text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!editedTitle.trim()}>
              Save
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <h4 className="flex-1 text-sm font-bold">{task.title}</h4>
            <div className="flex gap-1">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  resetEdits();
                  setIsEditing(true);
                }}
                onPointerDown={(event) => event.stopPropagation()}
                className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
                aria-label="Edit task"
              >
                <Edit2 className="size-4 text-gray-600" />
              </button>
              {onDuplicate && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDuplicate(task);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
                  aria-label="Duplicate task"
                >
                  <Copy className="size-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="mt-3 text-xs leading-relaxed text-gray-600">{task.description}</p>
          )}
        </>
      )}
    </div>
  );
}
