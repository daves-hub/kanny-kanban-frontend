import { apiClient } from "@/lib/api";
import { TaskSchema, TasksResponseSchema, type Task } from "@/types/kanban";

export const taskService = {
  async getAllByList(listId: number): Promise<Task[]> {
    const response = await apiClient.get<unknown>(`/tasks/lists/${listId}/tasks`);
    return TasksResponseSchema.parse(response);
  },

  async create(
    listId: number,
    data: { title: string; description?: string; position: number }
  ): Promise<Task> {
    const response = await apiClient.post<unknown>(`/tasks/lists/${listId}/tasks`, data);
    return TaskSchema.parse(response);
  },

  async update(
    id: number,
    data: { title?: string; description?: string; listId?: number; position?: number }
  ): Promise<Task> {
    const response = await apiClient.patch<unknown>(`/tasks/${id}`, data);
    return TaskSchema.parse(response);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
