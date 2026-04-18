import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimerReturn {
  elapsedMs: number
  running: boolean
  start: () => void
  reset: () => void
}

export function useTimer(timeLimitMs: number, onTimeout?: () => void): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timedOutRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    timedOutRef.current = false
    startTimeRef.current = Date.now()
    setElapsedMs(0)
    setRunning(true)
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    startTimeRef.current = null
    timedOutRef.current = false
    setElapsedMs(0)
    setRunning(false)
  }, [clearTimer])

  useEffect(() => {
    if (!running) {
      clearTimer()
      return
    }
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return
      const elapsed = Date.now() - startTimeRef.current
      setElapsedMs(elapsed)
      if (elapsed >= timeLimitMs && !timedOutRef.current) {
        timedOutRef.current = true
        setRunning(false)
        clearTimer()
        onTimeout?.()
      }
    }, 1)
    return clearTimer
  }, [running, timeLimitMs, onTimeout, clearTimer])

  return { elapsedMs, running, start, reset }
}
