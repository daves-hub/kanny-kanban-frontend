"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { Project, Board } from "@/types/kanban";
import { Sidebar } from "@/components/sidebar";
import { ProjectModal } from "@/components/project-modal";
import { BoardModal } from "@/components/board-modal";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { projectService } from "@/services/projects.service";
import { boardService } from "@/services/boards.service";
import { Button } from "@/components/ui/button";

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    setIsMobileSidebarOpen(false);
  }, [pathname]);

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

  const openMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

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
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={openMobileSidebar}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
          <Image
            src="/logo.png"
            alt="Kanny logo"
            width={323}
            height={122}
            className="h-8 w-auto md:h-10"
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

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="hidden flex-1 max-w-min md:flex">
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
            onSignout={signout}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-x-hidden">
          {children}
        </div>
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

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40"
            onClick={closeMobileSidebar}
            aria-hidden
          />
          <div className="relative h-full w-72">
            <Sidebar
              projects={projects}
              boards={boards}
              currentBoardId={currentBoardId}
              currentProjectId={currentProjectId}
              onNewProject={() => {
                setIsCreatingProject(true);
                closeMobileSidebar();
              }}
              onNewBoard={(projectId) => {
                setBoardModalProjectId(projectId ?? null);
                setEditingBoard(null);
                setIsCreatingBoard(true);
                closeMobileSidebar();
              }}
              onEditProject={(project) => {
                setEditingProject(project);
                closeMobileSidebar();
              }}
              onDeleteProject={(project) => {
                setDeletingProject(project);
                closeMobileSidebar();
              }}
              onEditBoard={(board) => {
                setEditingBoard(board);
                setBoardModalProjectId(board.projectId ?? null);
                closeMobileSidebar();
              }}
              onDeleteBoard={(board) => {
                setDeletingBoard(board);
                closeMobileSidebar();
              }}
              isMobile
              onClose={closeMobileSidebar}
              onSignout={() => { signout(); closeMobileSidebar(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
