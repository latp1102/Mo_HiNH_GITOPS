import type { Stats } from '../types'

interface Props {
  stats: Stats | null
}

export function StatsBar({ stats }: Props) {
  if (!stats) return null
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <span className="stat-number">{stats.total}</span>
        <span className="stat-label">Tổng cộng</span>
      </div>
      <div className="stat-card stat-pending">
        <span className="stat-number">{stats.pending}</span>
        <span className="stat-label">Chờ xử lý</span>
      </div>
      <div className="stat-card stat-progress">
        <span className="stat-number">{stats.inProgress}</span>
        <span className="stat-label">Đang thực hiện</span>
      </div>
      <div className="stat-card stat-completed">
        <span className="stat-number">{stats.completed}</span>
        <span className="stat-label">Hoàn thành</span>
      </div>
    </div>
  )
}
