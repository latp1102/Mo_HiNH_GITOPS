export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  title: string
  description: string
  status: TaskStatus
}

export interface Stats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

export interface AppInfo {
  version: string
  message: string
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: 'status-pending',
  IN_PROGRESS: 'status-progress',
  COMPLETED: 'status-completed',
}
