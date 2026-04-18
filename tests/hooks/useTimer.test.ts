import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../../src/hooks/useTimer'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useTimer', () => {
  it('初期状態はrunning=false、elapsed=0', () => {
    const { result } = renderHook(() => useTimer(5000))
    expect(result.current.running).toBe(false)
    expect(result.current.elapsedMs).toBe(0)
  })

  it('start後にelapsedが増加する', () => {
    const { result } = renderHook(() => useTimer(5000))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(1000)
  })

  it('制限時間に達するとonTimeoutが呼ばれる', () => {
    const onTimeout = vi.fn()
    const { result } = renderHook(() => useTimer(2000, onTimeout))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(2100) })
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('reset後にelapsedが0に戻る', () => {
    const { result } = renderHook(() => useTimer(5000))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })
    act(() => { result.current.reset() })
    expect(result.current.elapsedMs).toBe(0)
    expect(result.current.running).toBe(false)
  })
})
