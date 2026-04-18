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
  // refで最新値を保持することで、stale closureを防ぐ
  const onTimeoutRef = useRef(onTimeout)
  const timeLimitRef = useRef(timeLimitMs)
  useEffect(() => { onTimeoutRef.current = onTimeout }, [onTimeout])
  useEffect(() => { timeLimitRef.current = timeLimitMs }, [timeLimitMs])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // start()はインターバルを直接作成する。
  // useEffectのrunning依存では、React18のバッチ処理で
  // reset()→start()が同一レンダリングにまとめられるとrunningが
  // true→trueのまま変化せず再起動されないため。
  const start = useCallback(() => {
    clearTimer()
    timedOutRef.current = false
    startTimeRef.current = Date.now()
    setElapsedMs(0)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return
      const elapsed = Date.now() - startTimeRef.current
      setElapsedMs(elapsed)
      if (elapsed >= timeLimitRef.current && !timedOutRef.current) {
        timedOutRef.current = true
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setRunning(false)
        onTimeoutRef.current?.()
      }
    }, 50)
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    startTimeRef.current = null
    timedOutRef.current = false
    setElapsedMs(0)
    setRunning(false)
  }, [clearTimer])

  // アンマウント時のクリーンアップ
  useEffect(() => () => clearTimer(), [clearTimer])

  return { elapsedMs, running, start, reset }
}
