"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { Project, Board } from "@/types/kanban";
import { Sidebar } from "@/components/sidebar";
import { ProjectModal } from "@/components/project-modal";
import { BoardModal } from "@/components/board-modal";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { projectService } from "@/services/projects.service";
import { boardService } from "@/services/boards.service";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signout, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar modals
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [boardModalProjectId, setBoardModalProjectId] = useState<number | null>(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch projects and boards
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user) {
        if (!isMounted) return;
        setProjects([]);
        setBoards([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const [projectsResult, boardsResult] = await Promise.allSettled([
        projectService.getAll(),
        boardService.getAll(),
      ]);

      if (!isMounted) return;

      if (projectsResult.status === "fulfilled") {
        setProjects(projectsResult.value || []);
      } else {
        console.error("Failed to fetch projects:", projectsResult.reason);
        setProjects([]);
      }

      if (boardsResult.status === "fulfilled") {
        setBoards(boardsResult.value || []);
      } else {
        console.error("Failed to fetch boards:", boardsResult.reason);
        setBoards([]);
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Determine current board and project from URL
  const currentBoardId = pathname?.match(/\/board\/(\d+)/)?.[1] 
    ? parseInt(pathname.match(/\/board\/(\d+)/)![1]) 
    : undefined;
  const currentProjectId = pathname?.match(/\/projects\/(\d+)/)?.[1]
    ? parseInt(pathname.match(/\/projects\/(\d+)/)![1])
    : undefined;

  // Project handlers
  const handleSaveProject = async (name: string, description: string) => {
    try {
      if (editingProject) {
        const updated = await projectService.update(editingProject.id, { name, description });
        setProjects(prevProjects => prevProjects.map(p => p.id === updated.id ? updated : p));
        setEditingProject(null);
      } else {
        const newProject = await projectService.create({ name, description });
        setProjects(prevProjects => [newProject, ...prevProjects]);
        setIsCreatingProject(false);
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project. Please try again.");
    }
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
  };

  const confirmDeleteProject = async () => {
    if (deletingProject) {
      try {
        await projectService.delete(deletingProject.id);
        setProjects(prevProjects => prevProjects.filter(p => p.id !== deletingProject.id));
        setBoards(prevBoards => prevBoards.filter(b => b.projectId !== deletingProject.id));
        setDeletingProject(null);
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  // Board handlers
  const handleSaveBoard = async (name: string, projectId: number | null) => {
    try {
      if (editingBoard) {
        const updated = await boardService.update(editingBoard.id, { name, projectId });
        setBoards(prevBoards => prevBoards.map(b => b.id === updated.id ? updated : b));
        setEditingBoard(null);
        setBoardModalProjectId(null);
      } else {
        const newBoard = await boardService.create({ name, projectId: projectId ?? undefined });
        setBoards(prevBoards => [newBoard, ...prevBoards]);
        setIsCreatingBoard(false);
        setBoardModalProjectId(null);
      }
    } catch (error) {
      console.error("Failed to save board:", error);
      alert("Failed to save board. Please try again.");
    }
  };

  const handleDeleteBoard = (board: Board) => {
    setDeletingBoard(board);
  };

  const confirmDeleteBoard = async () => {
    if (deletingBoard) {
      try {
        await boardService.delete(deletingBoard.id);
        setBoards(prevBoards => prevBoards.filter(b => b.id !== deletingBoard.id));
        setDeletingBoard(null);
      } catch (error) {
        console.error("Failed to delete board:", error);
        alert("Failed to delete board. Please try again.");
      }
    }
  };

  // Show loading state while checking auth
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Kanny logo"
            width={323}
            height={122}
            className="h-10 w-auto"
            priority
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user?.name || user?.email}</span>
          <button
            onClick={signout}
            className="flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            title="Sign out"
          >
            <User className="size-4" />
          </button>
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
          onNewBoard={(projectId) => {
            setBoardModalProjectId(projectId ?? null);
            setEditingBoard(null);
            setIsCreatingBoard(true);
          }}
          onEditProject={(project) => setEditingProject(project)}
          onDeleteProject={handleDeleteProject}
          onEditBoard={(board) => {
            setEditingBoard(board);
            setBoardModalProjectId(board.projectId ?? null);
          }}
          onDeleteBoard={handleDeleteBoard}
        />

        {/* Main Content */}
        {children}
      </div>

      {/* Project Modal */}
      <ProjectModal
        key={editingProject ? `project-${editingProject.id}` : `project-new`}
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
        key={editingBoard ? `board-${editingBoard.id}` : `board-create-${boardModalProjectId ?? "none"}`}
        open={isCreatingBoard || !!editingBoard}
        onClose={() => {
          setIsCreatingBoard(false);
          setEditingBoard(null);
          setBoardModalProjectId(null);
        }}
        onSave={handleSaveBoard}
        board={editingBoard}
        projects={projects}
        defaultProjectId={boardModalProjectId}
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
