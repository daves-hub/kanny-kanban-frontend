import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
};

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-dashed-red">
        <DialogHeader>
          <DialogTitle className="text-center text-base">
            {title}
          </DialogTitle>
          {description && (
            <p className="text-center text-sm text-gray-600">{description}</p>
          )}
        </DialogHeader>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 sm:flex-1"
          >
            Cancel
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
