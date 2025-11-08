import type { Task } from "@/types/kanban";
import { X, Edit2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskDetailPanelProps = {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
};

export function TaskDetailPanel({
  task,
  open,
  onClose,
  onEdit,
}: TaskDetailPanelProps) {
  if (!task) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[380px] transform border-l-4 border-red-400 bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-3">
                <ShoppingBag className="size-8 text-gray-700" />
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm p-1 transition-colors hover:bg-gray-100"
              aria-label="Close panel"
            >
              <X className="size-5 text-gray-600" />
            </button>
          </div>

          {/* Title */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {task.title}
            </h2>
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="rounded p-1 transition-colors hover:bg-gray-100"
                aria-label="Edit task"
              >
                <Edit2 className="size-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-gray-600">
                {task.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
