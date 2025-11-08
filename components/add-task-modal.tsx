import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type AddTaskModalProps = {
  listId: number;
  onAdd: (title: string, description: string) => void;
  onClose: () => void;
};

export function AddTaskModal({ onAdd, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, description);
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <div className="border-dashed-blue bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-title">Email</Label>
          <Input
            id="task-title"
            type="email"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter email"
            className="h-10 rounded-full"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-description">Message</Label>
          <Textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type your message here"
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button type="submit" className="flex-1">
            Add +
          </Button>
        </div>
      </form>
    </div>
  );
}
