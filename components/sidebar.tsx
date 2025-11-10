"use client";

import { useState } from "react";
import type { Project, Board } from "@/types/kanban";
import { 
  FolderKanban, 
  LayoutDashboard, 
  Plus, 
  ChevronRight, 
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SidebarProps = {
  projects: Project[];
  boards: Board[];
  currentBoardId?: number;
  currentProjectId?: number;
  onNewProject: () => void;
  onNewBoard: (projectId?: number | null) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onEditBoard: (board: Board) => void;
  onDeleteBoard: (board: Board) => void;
};

export function Sidebar({
  projects,
  boards,
  currentBoardId,
  currentProjectId,
  onNewProject,
  onNewBoard,
  onEditProject,
  onDeleteProject,
  onEditBoard,
  onDeleteBoard,
}: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [activeMenu, setActiveMenu] = useState<{ type: 'project' | 'board', id: number } | null>(null);

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const recentProjects = (projects?.slice(0, 5) || []).filter(p => p && p.id);
  const standaloneBoards = (boards?.filter(b => b && !b.projectId) || []);

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      {/* Projects Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Projects
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={onNewProject}
                className="rounded p-1 transition-colors hover:bg-gray-100"
                title="New project"
              >
                <Plus className="size-4 text-gray-600" />
              </button>
              <Link
                href="/dashboard/projects"
                className="rounded p-1 transition-colors hover:bg-gray-100"
                title="See all projects"
              >
                <ChevronRight className="size-4 text-gray-600" />
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            {recentProjects.filter(Boolean).map((project) => {
              if (!project || !project.id) return null;
              
              const isExpanded = expandedProjects.has(project.id);
              const projectBoards = boards?.filter(b => b && b.projectId === project.id) || [];
              const isActive = currentProjectId === project.id;

              return (
                <div key={project.id}>
                  <div
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
                    )}
                  >
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="flex flex-1 items-center gap-2"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleProject(project.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <ChevronRight
                          className={cn(
                            "size-4 shrink-0 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </button>
                      <FolderKanban className="size-4 shrink-0" />
                      <span className="flex-1 truncate font-medium">
                        {project.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {projectBoards.length}
                      </span>
                    </Link>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu?.type === 'project' && activeMenu?.id === project.id 
                              ? null 
                              : { type: 'project', id: project.id }
                          );
                        }}
                        className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </button>

                      {activeMenu?.type === 'project' && activeMenu?.id === project.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProject(project);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProject(project);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && projectBoards.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-3">
                      {projectBoards.filter(Boolean).map((board) => {
                        if (!board || !board.id) return null;
                        
                        return (
                        <Link
                          key={board.id}
                          href={`/dashboard/board/${board.id}`}
                          className={cn(
                            "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                            currentBoardId === board.id
                              ? "bg-blue-50 text-blue-600"
                              : "hover:bg-gray-100"
                          )}
                        >
                          <LayoutDashboard className="size-3.5 shrink-0" />
                          <span className="flex-1 truncate">{board.name}</span>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveMenu(
                                  activeMenu?.type === 'board' && activeMenu?.id === board.id
                                    ? null
                                    : { type: 'board', id: board.id }
                                );
                              }}
                              className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </button>

                            {activeMenu?.type === 'board' && activeMenu?.id === board.id && (
                              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onEditBoard(board);
                                    setActiveMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                  <Pencil className="size-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onDeleteBoard(board);
                                    setActiveMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                      })}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onNewBoard(project.id);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-primary transition-colors hover:bg-primary/5"
                      >
                        <Plus className="size-3.5" />
                        Add board
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {(!recentProjects || recentProjects.length === 0) && (
              <div className="px-2 py-4 text-center">
                <p className="text-sm text-gray-500">No projects yet</p>
                <button
                  onClick={onNewProject}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Create your first project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Standalone Boards Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Boards
            </h2>
            <button
              onClick={() => onNewBoard(null)}
              className="rounded p-1 transition-colors hover:bg-gray-100"
              title="New board"
            >
              <Plus className="size-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-1">
            {standaloneBoards.filter(Boolean).map((board) => {
              if (!board || !board.id) return null;
              
              return (
                <Link
                  key={board.id}
                  href={`/dashboard/board/${board.id}`}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    currentBoardId === board.id
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100"
                  )}
                >
                  <LayoutDashboard className="size-4 shrink-0" />
                  <span className="flex-1 truncate font-medium">{board.name}</span>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveMenu(
                        activeMenu?.type === 'board' && activeMenu?.id === board.id
                          ? null
                          : { type: 'board', id: board.id }
                      );
                    }}
                    className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>

                  {activeMenu?.type === 'board' && activeMenu?.id === board.id && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onEditBoard(board);
                          setActiveMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onDeleteBoard(board);
                          setActiveMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </Link>
              );
            })}

            {(!standaloneBoards || standaloneBoards.length === 0) && (
              <div className="px-2 py-4 text-center">
                <p className="text-sm text-gray-500">No boards yet</p>
                <button
                  onClick={() => onNewBoard()}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Create your first board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </aside>
  );
}
