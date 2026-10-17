import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsBar } from '../components/StatsBar'
import { FilterBar } from '../components/FilterBar'

describe('StatsBar', () => {
  it('hiển thị đủ 4 thẻ thống kê', () => {
    render(<StatsBar stats={{ total: 5, pending: 2, inProgress: 1, completed: 2 }} />)
    expect(screen.getByText('Tổng cộng')).toBeInTheDocument()
    expect(screen.getByText('Chờ xử lý')).toBeInTheDocument()
    expect(screen.getByText('Đang thực hiện')).toBeInTheDocument()
    expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('không render gì khi stats là null', () => {
    const { container } = render(<StatsBar stats={null} />)
    expect(container.querySelector('.stats-bar')).toBeNull()
  })
})

describe('FilterBar', () => {
  it('hiển thị 4 nút lọc', () => {
    render(<FilterBar current="ALL" onChange={() => {}} />)
    expect(screen.getByText('Tất cả')).toBeInTheDocument()
    expect(screen.getByText('Chờ xử lý')).toBeInTheDocument()
    expect(screen.getByText('Đang thực hiện')).toBeInTheDocument()
    expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
  })

  it('đánh dấu active đúng nút được chọn', () => {
    render(<FilterBar current="COMPLETED" onChange={() => {}} />)
    expect(screen.getByText('Hoàn thành')).toHaveClass('active')
    expect(screen.getByText('Tất cả')).not.toHaveClass('active')
  })
})
