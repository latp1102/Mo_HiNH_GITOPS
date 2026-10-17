import type { AppInfo, Stats, Task, TaskRequest, TaskStatus } from './types'

const BASE = ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `Lỗi ${res.status}`
    try {
      const body = await res.json()
      if (body.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  listTasks: (status?: TaskStatus) =>
    request<Task[]>(status ? `/api/tasks?status=${status}` : '/api/tasks'),

  getStats: () => request<Stats>('/api/tasks/stats'),

  getAppInfo: () => request<AppInfo>('/api/version'),

  createTask: (data: TaskRequest) =>
    request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),

  updateTask: (id: number, data: TaskRequest) =>
    request<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  updateStatus: (id: number, status: TaskStatus) =>
    request<Task>(`/api/tasks/${id}/status?status=${status}`, { method: 'PUT' }),

  deleteTask: (id: number) =>
    request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
}
