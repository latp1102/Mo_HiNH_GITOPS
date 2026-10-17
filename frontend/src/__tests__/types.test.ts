import { describe, expect, it } from 'vitest'
import { STATUS_COLORS, STATUS_LABELS, type TaskStatus } from '../types'

describe('Task types & constants', () => {
  it('STATUS_LABELS có đủ 3 trạng thái tiếng Việt', () => {
    expect(STATUS_LABELS.PENDING).toBe('Chờ xử lý')
    expect(STATUS_LABELS.IN_PROGRESS).toBe('Đang thực hiện')
    expect(STATUS_LABELS.COMPLETED).toBe('Hoàn thành')
  })

  it('STATUS_COLORS khớp keys với STATUS_LABELS', () => {
    const labelKeys = Object.keys(STATUS_LABELS).sort()
    const colorKeys = Object.keys(STATUS_COLORS).sort()
    expect(labelKeys).toEqual(colorKeys)
  })

  it('mọi TaskStatus đều có label và color', () => {
    const statuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED']
    for (const s of statuses) {
      expect(STATUS_LABELS[s]).toBeTruthy()
      expect(STATUS_COLORS[s]).toBeTruthy()
    }
  })
})
