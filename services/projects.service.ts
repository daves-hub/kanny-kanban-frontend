import { apiClient } from "@/lib/api";
import {
  ProjectSchema,
  ProjectWithBoardsSchema,
  ProjectsResponseSchema,
  type Project,
  type ProjectWithBoards,
} from "@/types/kanban";

export const projectService = {
  async getAll(): Promise<Project[]> {
    const response = await apiClient.get<unknown>("/projects");
    return ProjectsResponseSchema.parse(response);
  },

  async getById(id: number): Promise<ProjectWithBoards> {
    const response = await apiClient.get<unknown>(`/projects/${id}`);
    return ProjectWithBoardsSchema.parse(response);
  },

  async create(data: { name: string; description?: string }): Promise<Project> {
    const response = await apiClient.post<unknown>("/projects", data);
    return ProjectSchema.parse(response);
  },

  async update(id: number, data: { name?: string; description?: string }): Promise<Project> {
    const response = await apiClient.patch<unknown>(`/projects/${id}`, data);
    return ProjectSchema.parse(response);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
