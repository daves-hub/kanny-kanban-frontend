import { apiClient } from "@/lib/api";
import { ListSchema, ListsResponseSchema, type List } from "@/types/kanban";

export const listService = {
  async getAllByBoard(boardId: number): Promise<List[]> {
    const response = await apiClient.get<unknown>(`/lists/boards/${boardId}/lists`);
    return ListsResponseSchema.parse(response);
  },

  async create(boardId: number, data: { title: string; position: number }): Promise<List> {
    const response = await apiClient.post<unknown>(`/lists/boards/${boardId}/lists`, data);
    return ListSchema.parse(response);
  },

  async update(id: number, data: { title?: string; position?: number }): Promise<List> {
    const response = await apiClient.patch<unknown>(`/lists/${id}`, data);
    return ListSchema.parse(response);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/lists/${id}`);
  },
};
