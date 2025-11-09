import { apiClient } from "@/lib/api";
import {
  BoardSchema,
  BoardWithListsSchema,
  BoardsResponseSchema,
  type Board,
  type BoardWithLists,
} from "@/types/kanban";

export const boardService = {
  async getAll(projectId?: number): Promise<Board[]> {
    const endpoint = projectId ? `/boards?projectId=${projectId}` : "/boards";
    const response = await apiClient.get<unknown>(endpoint);
    return BoardsResponseSchema.parse(response);
  },

  async getById(id: number): Promise<BoardWithLists> {
    const response = await apiClient.get<unknown>(`/boards/${id}`);
    return BoardWithListsSchema.parse(response);
  },

  async create(data: { name: string; projectId?: number }): Promise<BoardWithLists> {
    const response = await apiClient.post<unknown>("/boards", data);
    return BoardWithListsSchema.parse(response);
  },

  async update(id: number, data: { name?: string; projectId?: number | null }): Promise<Board> {
    const response = await apiClient.patch<unknown>(`/boards/${id}`, data);
    return BoardSchema.parse(response);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/boards/${id}`);
  },
};
