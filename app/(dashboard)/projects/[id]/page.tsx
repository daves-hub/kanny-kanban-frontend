"use client";

import { useState } from "react";
import type { Board } from "@/types/kanban";
import { Search, LayoutDashboard, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data
const mockBoards: Board[] = [
  {
    id: 1,
    name: "Marketing Website",
    ownerId: 1,
    projectId: 1,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "Brand Guidelines",
    ownerId: 1,
    projectId: 1,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "Content Strategy",
    ownerId: 1,
    projectId: 1,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock task counts per board
const mockBoardStats = {
  1: { todo: 8, inProgress: 5, completed: 12 },
  2: { todo: 3, inProgress: 2, completed: 7 },
  3: { todo: 15, inProgress: 8, completed: 20 },
};

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const [boards] = useState<Board[]>(mockBoards);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStats = (boardId: number) => {
    return mockBoardStats[boardId as keyof typeof mockBoardStats] || { todo: 0, inProgress: 0, completed: 0 };
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Website Redesign</h1>
              <p className="text-sm text-gray-500">
                {filteredBoards.length} {filteredBoards.length === 1 ? 'board' : 'boards'}
              </p>
            </div>
            <Button>
              <Plus className="size-4" />
              New Board
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Boards List */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          {filteredBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LayoutDashboard className="size-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">
                {searchQuery ? "No boards found" : "No boards yet"}
              </p>
              {!searchQuery && (
                <Button className="mt-4">
                  <Plus className="size-4" />
                  Create your first board
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBoards.map((board) => {
                const stats = getStats(board.id);
                const totalTasks = stats.todo + stats.inProgress + stats.completed;

                return (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className="group block rounded-xl border bg-white p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 transition-colors group-hover:bg-blue-100">
                          <LayoutDashboard className="size-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {board.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} • Updated {new Date(board.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Task Stats */}
                      <div className="flex items-center gap-4">
                        {/* Todo */}
                        <div className="flex items-center gap-1.5">
                          <div className="size-2 rounded-full bg-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            {stats.todo}
                          </span>
                          <span className="text-xs text-gray-500">Todo</span>
                        </div>

                        {/* In Progress */}
                        <div className="flex items-center gap-1.5">
                          <div className="size-2 rounded-full bg-orange-400" />
                          <span className="text-sm font-medium text-orange-600">
                            {stats.inProgress}
                          </span>
                          <span className="text-xs text-gray-500">In Progress</span>
                        </div>

                        {/* Completed */}
                        <div className="flex items-center gap-1.5">
                          <div className="size-2 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            {stats.completed}
                          </span>
                          <span className="text-xs text-gray-500">Completed</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
