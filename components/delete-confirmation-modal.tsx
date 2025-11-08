import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/kanban";

type DeleteConfirmationModalProps = {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmationModal({
  task,
  open,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-base">
            Are you sure you want to delete this task?
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 sm:flex-1"
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 sm:flex-1"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
