"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/types/kanban";
import { FolderKanban, Search, ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { projectService } from "@/services/projects.service";
import { boardService } from "@/services/boards.service";
import { ProjectModal } from "@/components/project-modal";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [boardCounts, setBoardCounts] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuProjectId, setMenuProjectId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const sortByRecent = (items: Project[]) =>
    [...items].sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [projectsResult, boardsResult] = await Promise.allSettled([
          projectService.getAll(),
          boardService.getAll(),
        ]);

        if (!isMounted) return;

          if (projectsResult.status === "fulfilled") {
          setProjects(sortByRecent(projectsResult.value || []));
        } else {
          console.error("Failed to fetch projects:", projectsResult.reason);
          setProjects([]);
        }

        if (boardsResult.status === "fulfilled") {
          const counts: Record<number, number> = {};
          boardsResult.value.forEach(board => {
            if (board.projectId) {
              counts[board.projectId] = (counts[board.projectId] || 0) + 1;
            }
          });
          setBoardCounts(counts);
        } else {
          console.error("Failed to fetch boards:", boardsResult.reason);
          setBoardCounts({});
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch projects page data:", error);
        setProjects([]);
        setBoardCounts({});
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const closeProjectMenu = () => setMenuProjectId(null);

  const handleSaveProject = async (name: string, description: string) => {
    if (!editingProject) return;

    try {
      const updated = await projectService.update(editingProject.id, {
        name,
        description: description ? description : undefined,
      });

  setProjects(prev => sortByRecent(prev.map(project => (project.id === updated.id ? updated : project))));
      setEditingProject(null);
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project. Please try again.");
    }
  };

  const confirmDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      await projectService.delete(deletingProject.id);
  setProjects(prev => prev.filter(project => project.id !== deletingProject.id));
      setBoardCounts(prev => {
        const next = { ...prev };
        delete next[deletingProject.id];
        return next;
      });
      setDeletingProject(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">All Projects</h1>
              <p className="text-sm text-gray-500">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FolderKanban className="size-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">
                {searchQuery ? "No projects found" : "No projects yet"}
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
              {filteredProjects.map((project) => {
                const boardCount = boardCounts[project.id] || 0;
                
                return (
                  <div
                    key={project.id}
                    className="group relative mb-6 break-inside-avoid"
                  >
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="block rounded-lg border bg-white p-5 pr-12 transition-all hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="size-5 shrink-0 text-primary" />
                          <h3 className="font-semibold">{project.name}</h3>
                        </div>
                      </div>

                      {project.description && (
                        <p className="mb-3 text-sm text-gray-600 line-clamp-3">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{boardCount} {boardCount === 1 ? 'board' : 'boards'}</span>
                        <span>•</span>
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </Link>

                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={menuProjectId === project.id}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setMenuProjectId(prev => (prev === project.id ? null : project.id));
                      }}
                      className="pointer-events-none absolute right-4 top-4 flex rounded-full bg-white p-1 text-gray-600 opacity-0 shadow-sm transition hover:text-gray-900 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:shadow-md"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>

                    {menuProjectId === project.id && (
                      <div
                        className="absolute right-4 top-12 z-20 w-44 rounded-lg border bg-white py-1 shadow-lg"
                        role="menu"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setEditingProject(project);
                            setIsProjectModalOpen(true);
                            closeProjectMenu();
                          }}
                        >
                          <Pencil className="size-3.5" />
                          Edit project
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeletingProject(project);
                            closeProjectMenu();
                          }}
                        >
                          <Trash2 className="size-3.5" />
                          Delete project
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {menuProjectId !== null && (
        <div
          className="fixed inset-0 z-10"
          onClick={closeProjectMenu}
        />
      )}

      <ProjectModal
        open={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject ?? undefined}
      />

      <ConfirmationDialog
        open={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={confirmDeleteProject}
        title={deletingProject ? `Delete "${deletingProject.name}"?` : "Delete project"}
        description="All boards and tasks within this project will also be deleted. This action cannot be undone."
      />
    </div>
  );
}
