import { STATUS_COLORS, STATUS_LABELS, type Task, type TaskStatus } from '../types'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
  busy: boolean
}

export function TaskItem({ task, onEdit, onDelete, onStatusChange, busy }: Props) {
  return (
    <div className={`task-card ${task.status === 'COMPLETED' ? 'task-done' : ''}`}>
      <div className="task-main">
        <div className="task-header">
          <h3>{task.title}</h3>
          <span className={`status-badge ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span>#{task.id}</span>
          <span>Tạo: {new Date(task.createdAt).toLocaleString('vi-VN')}</span>
        </div>
      </div>
      <div className="task-actions">
        {task.status !== 'COMPLETED' && (
          <button
            className="btn btn-success"
            disabled={busy}
            onClick={() => onStatusChange(task, 'COMPLETED')}
            title="Đánh dấu hoàn thành"
          >
            ✓
          </button>
        )}
        {task.status === 'PENDING' && (
          <button
            className="btn btn-info"
            disabled={busy}
            onClick={() => onStatusChange(task, 'IN_PROGRESS')}
            title="Bắt đầu thực hiện"
          >
            ▶
          </button>
        )}
        <button className="btn btn-edit" disabled={busy} onClick={() => onEdit(task)}>
          Sửa
        </button>
        <button className="btn btn-danger" disabled={busy} onClick={() => onDelete(task)}>
          Xóa
        </button>
      </div>
    </div>
  )
}
