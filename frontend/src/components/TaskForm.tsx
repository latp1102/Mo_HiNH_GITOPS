import { useEffect, useState, type FormEvent } from 'react'
import type { Task, TaskRequest, TaskStatus } from '../types'
import { STATUS_LABELS } from '../types'

interface Props {
  editing: Task | null
  onSubmit: (data: TaskRequest) => Promise<void>
  onCancel: () => void
  busy: boolean
}

export function TaskForm({ editing, onSubmit, onCancel, busy }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('PENDING')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setDescription(editing.description)
      setStatus(editing.status)
    } else {
      setTitle('')
      setDescription('')
      setStatus('PENDING')
    }
    setError('')
  }, [editing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Tiêu đề không được để trống')
      return
    }
    setError('')
    await onSubmit({ title: title.trim(), description: description.trim(), status })
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{editing ? `Chỉnh sửa task #${editing.id}` : 'Tạo task mới'}</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="title">Tiêu đề *</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề công việc"
          maxLength={200}
        />
      </div>
      <div className="form-group">
        <label htmlFor="desc">Mô tả</label>
        <textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả chi tiết (không bắt buộc)"
          rows={3}
        />
      </div>
      <div className="form-group">
        <label htmlFor="status">Trạng thái</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Hủy
        </button>
      </div>
    </form>
  )
}
