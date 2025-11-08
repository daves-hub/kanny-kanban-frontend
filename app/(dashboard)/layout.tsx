"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { Project, Board } from "@/types/kanban";
import { Sidebar } from "@/components/sidebar";
import { ProjectModal } from "@/components/project-modal";
import { BoardModal } from "@/components/board-modal";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { User } from "lucide-react";

// Mock projects and boards data
const mockProjects: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Complete redesign of the company website",
    ownerId: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Mobile App",
    description: "Native mobile application",
    ownerId: 1,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockBoards: Board[] = [
  {
    id: 1,
    name: "Main Board",
    ownerId: 1,
    projectId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Design Tasks",
    ownerId: 1,
    projectId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Development",
    ownerId: 1,
    projectId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [boards, setBoards] = useState<Board[]>(mockBoards);
  
  // Sidebar modals
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  // Determine current board and project from URL
  const currentBoardId = pathname?.match(/\/board\/(\d+)/)?.[1] 
    ? parseInt(pathname.match(/\/board\/(\d+)/)![1]) 
    : undefined;
  const currentProjectId = pathname?.match(/\/projects\/(\d+)/)?.[1]
    ? parseInt(pathname.match(/\/projects\/(\d+)/)![1])
    : undefined;

  // Project handlers
  const handleSaveProject = (name: string, description: string) => {
    if (editingProject) {
      setProjects(projects.map(p =>
        p.id === editingProject.id
          ? { ...p, name, description, updatedAt: new Date().toISOString() }
          : p
      ));
      setEditingProject(null);
    } else {
      const newProject: Project = {
        id: Date.now(),
        name,
        description,
        ownerId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects([newProject, ...projects]);
      setIsCreatingProject(false);
    }
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
  };

  const confirmDeleteProject = () => {
    if (deletingProject) {
      setProjects(projects.filter(p => p.id !== deletingProject.id));
      // Also delete boards in this project
      setBoards(boards.filter(b => b.projectId !== deletingProject.id));
      setDeletingProject(null);
    }
  };

  // Board handlers
  const handleSaveBoard = (name: string) => {
    if (editingBoard) {
      setBoards(boards.map(b =>
        b.id === editingBoard.id
          ? { ...b, name, updatedAt: new Date().toISOString() }
          : b
      ));
      setEditingBoard(null);
    } else {
      const newBoard: Board = {
        id: Date.now(),
        name,
        ownerId: 1,
        projectId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBoards([newBoard, ...boards]);
      setIsCreatingBoard(false);
    }
  };

  const handleDeleteBoard = (board: Board) => {
    setDeletingBoard(board);
  };

  const confirmDeleteBoard = () => {
    if (deletingBoard) {
      setBoards(boards.filter(b => b.id !== deletingBoard.id));
      setDeletingBoard(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-end">
            <div className="size-8 rounded-full border-2 border-white bg-primary z-1" />
            <div className="size-10 -ml-2 rounded-full bg-primary" />
          </div>
          <h1 className="text-2xl font-bold">Kanny</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ejemen Iboi</span>
          <div className="flex size-8 items-center justify-center rounded-full bg-gray-200">
            <User className="size-4" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          projects={projects}
          boards={boards}
          currentBoardId={currentBoardId}
          currentProjectId={currentProjectId}
          onNewProject={() => setIsCreatingProject(true)}
          onNewBoard={() => setIsCreatingBoard(true)}
          onEditProject={(project) => setEditingProject(project)}
          onDeleteProject={handleDeleteProject}
          onEditBoard={(board) => setEditingBoard(board)}
          onDeleteBoard={handleDeleteBoard}
        />

        {/* Main Content */}
        {children}
      </div>

      {/* Project Modal */}
      <ProjectModal
        open={isCreatingProject || !!editingProject}
        onClose={() => {
          setIsCreatingProject(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />

      {/* Board Modal */}
      <BoardModal
        open={isCreatingBoard || !!editingBoard}
        onClose={() => {
          setIsCreatingBoard(false);
          setEditingBoard(null);
        }}
        onSave={handleSaveBoard}
        board={editingBoard}
      />

      {/* Delete Project Confirmation */}
      <ConfirmationDialog
        open={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={confirmDeleteProject}
        title={`Delete "${deletingProject?.name}"?`}
        description="All boards and tasks within this project will also be deleted. This action cannot be undone."
      />

      {/* Delete Board Confirmation */}
      <ConfirmationDialog
        open={!!deletingBoard}
        onClose={() => setDeletingBoard(null)}
        onConfirm={confirmDeleteBoard}
        title={`Delete "${deletingBoard?.name}"?`}
        description="All tasks within this board will also be deleted. This action cannot be undone."
      />
    </div>
  );
}
