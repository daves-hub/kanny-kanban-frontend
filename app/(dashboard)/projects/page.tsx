"use client";

import { useState } from "react";
import type { Project } from "@/types/kanban";
import { FolderKanban, Search, ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

// Mock data
const mockProjects: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Complete redesign of the company website with modern UI/UX",
    ownerId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Mobile App",
    description: "Native mobile application for iOS and Android",
    ownerId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Marketing Campaign Q4",
    description: null,
    ownerId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ProjectsPage() {
  const [projects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock board counts
  const getBoardCount = (projectId: number) => {
    return Math.floor(Math.random() * 5) + 1;
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <Link
              href="/board"
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <ArrowLeft className="size-5" />
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                const boardCount = getBoardCount(project.id);
                
                return (
                  <div
                    key={project.id}
                    className="group relative mb-6 break-inside-avoid"
                  >
                    <Link
                      href={`/project/${project.id}`}
                      className="block rounded-lg border bg-white p-5 transition-all hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="size-5 shrink-0 text-primary" />
                          <h3 className="font-semibold">{project.name}</h3>
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveMenu(activeMenu === project.id ? null : project.id);
                            }}
                            className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>

                          {activeMenu === project.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveMenu(null);
                                }}
                              />
                              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    // This will be handled by the layout
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
                                    // This will be handled by the layout
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
