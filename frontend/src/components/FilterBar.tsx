import type { TaskStatus } from '../types'
import { STATUS_LABELS } from '../types'

interface Props {
  current: TaskStatus | 'ALL'
  onChange: (value: TaskStatus | 'ALL') => void
}

export function FilterBar({ current, onChange }: Props) {
  return (
    <div className="filter-bar">
      <span className="filter-label">Lọc:</span>
      <button
        className={`filter-btn ${current === 'ALL' ? 'active' : ''}`}
        onClick={() => onChange('ALL')}
      >
        Tất cả
      </button>
      {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
        <button
          key={s}
          className={`filter-btn ${current === s ? 'active' : ''}`}
          onClick={() => onChange(s)}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  )
}
