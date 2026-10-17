import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import type { AppInfo, Stats, Task, TaskRequest, TaskStatus } from './types'
import { TaskItem } from './components/TaskItem'
import { TaskForm } from './components/TaskForm'
import { StatsBar } from './components/StatsBar'
import { FilterBar } from './components/FilterBar'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [backendDown, setBackendDown] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setBackendDown(false)
      const [taskList, statsData, info] = await Promise.all([
        api.listTasks(),
        api.getStats(),
        api.getAppInfo(),
      ])
      setTasks(taskList)
      setStats(statsData)
      setAppInfo(info)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định'
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setBackendDown(true)
        setError('Không kết nối được tới Backend. Vui lòng thử lại sau.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const showNotice = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  const handleSubmit = async (data: TaskRequest) => {
    setBusy(true)
    try {
      if (editing) {
        await api.updateTask(editing.id, data)
        showNotice(`Đã cập nhật task #${editing.id}`)
      } else {
        await api.createTask(data)
        showNotice('Đã tạo task mới')
      }
      setShowForm(false)
      setEditing(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu task')
    } finally {
      setBusy(false)
    }
  }

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    setBusy(true)
    try {
      await api.updateStatus(task.id, status)
      showNotice(`Đã cập nhật trạng thái task #${task.id}`)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`Bạn có chắc muốn xóa task "${task.title}"?`)) return
    setBusy(true)
    try {
      await api.deleteTask(task.id)
      showNotice(`Đã xóa task #${task.id}`)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa task')
    } finally {
      setBusy(false)
    }
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter)

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>📋 GitOps Task Manager</h1>
          <p className="subtitle">Quản lý công việc — Demo CI/CD & GitOps</p>
        </div>
        <div className="header-info">
          {appInfo && (
            <span className="version-badge" title={appInfo.message}>
              Backend v{appInfo.version}
            </span>
          )}
          <span className="version-badge frontend-badge">
            Frontend v{import.meta.env.VITE_APP_VERSION || 'dev'}
          </span>
          {backendDown && <span className="badge-down">⚠ Backend mất kết nối</span>}
        </div>
      </header>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && !backendDown && <div className="alert alert-error">{error}</div>}
      {backendDown && (
        <div className="alert alert-error">
          Không kết nối được Backend.{' '}
          <button className="btn btn-link" onClick={refresh}>
            Thử lại
          </button>
        </div>
      )}

      <StatsBar stats={stats} />

      <div className="toolbar">
        <FilterBar current={filter} onChange={setFilter} />
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null)
            setShowForm(!showForm)
          }}
        >
          {showForm ? '✕ Đóng form' : '+ Tạo task'}
        </button>
      </div>

      {showForm && (
        <TaskForm
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
          }}
          busy={busy}
        />
      )}

      <main className="task-list">
        {loading ? (
          <div className="state-block">
            <div className="spinner" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="state-block empty">
            <p>📭 Không có task nào{filter !== 'ALL' ? ' phù hợp bộ lọc' : ''}.</p>
            <p className="hint">Nhấn "+ Tạo task" để bắt đầu.</p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={(t) => {
                setEditing(t)
                setShowForm(true)
              }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              busy={busy}
            />
          ))
        )}
      </main>

      <footer className="app-footer">
        <p>
          IT209 DevOps Fundamentals — Pipeline CI/CD End-to-End với GitOps, GitHub Actions & Argo CD
        </p>
      </footer>
    </div>
  )
}
