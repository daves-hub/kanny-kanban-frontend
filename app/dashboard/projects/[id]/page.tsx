"use client";

import { useState, useEffect, use } from "react";
import type { Project, ProjectWithBoards, ProjectBoard } from "@/types/kanban";
import { Search, LayoutDashboard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { boardService } from "@/services/boards.service";
import { projectService } from "@/services/projects.service";
import { BoardModal } from "@/components/board-modal";
import { Input } from "@/components/ui/input";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const projectId = parseInt(id);
  
  const [project, setProject] = useState<ProjectWithBoards | null>(null);
  const [boards, setBoards] = useState<ProjectBoard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  const projectOptions: Project[] = project ? [project] : [];

  const sortBoards = (items: ProjectBoard[]) =>
    [...items].sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
  const projectData = await projectService.getById(projectId);
    setProject(projectData);
    setBoards(sortBoards(projectData.boards ?? []));
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleSaveBoard = async (name: string, selectedProjectId: number | null) => {
    try {
      const created = await boardService.create({
        name,
        projectId: selectedProjectId ?? projectId,
      });

      const nextBoard: ProjectBoard = {
        id: created.id,
        name: created.name,
        ownerId: created.ownerId,
        projectId: created.projectId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };

      setBoards((prev) => sortBoards([...prev, nextBoard]));
      setProject((prev) =>
        prev
          ? {
              ...prev,
              boards: sortBoards([nextBoard, ...(prev.boards ?? [])]),
            }
          : prev
      );

      setIsBoardModalOpen(false);
    } catch (error) {
      console.error("Failed to create board:", error);
      alert("Failed to create board. Please try again.");
    }
  };

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{project?.name}</h1>
              <p className="text-sm text-gray-500">
                {filteredBoards.length} {filteredBoards.length === 1 ? "board" : "boards"}
              </p>
            </div>

            <Button onClick={() => setIsBoardModalOpen(true)}>New board</Button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
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
                <Button className="mt-6" onClick={() => setIsBoardModalOpen(true)}>
                  Create board
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBoards.map((board) => (
                <Link
                  key={board.id}
                  href={`/dashboard/board/${board.id}`}
                  className="block rounded-lg border bg-white p-5 transition-all hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <LayoutDashboard className="size-5 shrink-0 text-primary" />
                    <h3 className="flex-1 font-semibold">{board.name}</h3>
                  </div>

                  {board.updatedAt ? (
                    <div className="text-xs text-gray-500">
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BoardModal
        open={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSave={handleSaveBoard}
        board={null}
        projects={projectOptions}
        defaultProjectId={projectId}
      />
    </div>
  );
}
