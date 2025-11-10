"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import type { Project } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  project?: Project | null;
};

export function ProjectModal({ open, onClose, onSave, project }: ProjectModalProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");

  const resetForm = useCallback(() => {
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
  }, [project]);

  useEffect(() => {
    if (!open) return;
    const nextName = project?.name ?? "";
    const nextDescription = project?.description ?? "";
    startTransition(() => {
      setName(nextName);
      setDescription(nextDescription);
    });
  }, [open, project]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
    resetForm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] border-dashed-blue">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project" : "New Project"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter project name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter project description (optional)"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              resetForm();
              onClose();
            }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {project ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
