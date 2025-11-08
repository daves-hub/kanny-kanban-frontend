"use client";

import { useState, useEffect } from "react";
import type { Board } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type BoardModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  board?: Board | null;
};

export function BoardModal({ open, onClose, onSave, board }: BoardModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (board) {
      setName(board.name);
    } else {
      setName("");
    }
  }, [board, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {board ? "Edit Board" : "New Board"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter board name"
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {board ? "Save Changes" : "Create Board"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
