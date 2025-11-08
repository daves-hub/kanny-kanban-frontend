"use client";

import { FolderKanban, LayoutDashboard } from "lucide-react";

export default function WorkspacePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="rounded-full bg-blue-50 p-4">
            <FolderKanban className="size-12 text-primary" />
          </div>
          <div className="rounded-full bg-purple-50 p-4">
            <LayoutDashboard className="size-12 text-purple-500" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome to your workspace
        </h2>
        <p className="mt-2 text-gray-500">
          Select a project or board from the sidebar to get started
        </p>
      </div>
    </div>
  );
}
