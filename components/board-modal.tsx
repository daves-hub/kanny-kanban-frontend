"use client";

import { useCallback, useMemo, useState } from "react";
import type { Board, Project } from "@/types/kanban";
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
  onSave: (name: string, projectId: number | null) => void;
  projects: Project[];
  defaultProjectId?: number | null;
  board?: Board | null;
};

export function BoardModal({ open, onClose, onSave, board, projects, defaultProjectId = null }: BoardModalProps) {
  const initialName = board?.name ?? "";
  const initialProjectId = useMemo(() => board?.projectId ?? defaultProjectId ?? null, [board, defaultProjectId]);

  const [name, setName] = useState(initialName);
  const [projectId, setProjectId] = useState<number | null>(initialProjectId);

  const resetForm = useCallback(() => {
    setName(initialName);
    setProjectId(initialProjectId);
  }, [initialName, initialProjectId]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), projectId);
    resetForm();
  };

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[400px] border-dashed-blue">
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

          <div className="space-y-2">
            <Label htmlFor="board-project">Project</Label>
            <select
              id="board-project"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={projectId ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setProjectId(value === "" ? null : Number(value));
              }}
            >
              <option value="">Standalone board</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={handleClose}
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
