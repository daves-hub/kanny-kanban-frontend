import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex flex-col justify-end space-y-4">
      <div className="border-dashed-blue bg-blue-50/50 p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title"
            className="h-10 bg-white"
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
            className="bg-white"
            rows={4}
          />
        </div>

      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
        <Button type="submit" className="flex-1">
          Add <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
