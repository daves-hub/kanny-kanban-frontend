import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DeleteColumnProps = {
  isDraggingOver?: boolean;
};

export function DeleteColumn({ isDraggingOver = false }: DeleteColumnProps) {
  const { setNodeRef } = useDroppable({ id: "delete-zone" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-dashed-neutral flex h-full flex-col items-center justify-center rounded-lg bg-gray-50 p-8 transition-all",
        isDraggingOver && "border-dashed-blue bg-red-50"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-4 transition-all",
          isDraggingOver && "scale-110"
        )}
      >
        <div
          className={cn(
            "rounded-full p-6 transition-colors",
            isDraggingOver ? "bg-red-100" : "bg-gray-100"
          )}
        >
          <Trash2
            className={cn(
              "transition-colors",
              isDraggingOver ? "size-16 text-red-500" : "size-12 text-gray-400"
            )}
          />
        </div>
        {isDraggingOver && (
          <p className="text-sm font-medium text-red-600">Drop to delete</p>
        )}
      </div>
    </div>
  );
}
