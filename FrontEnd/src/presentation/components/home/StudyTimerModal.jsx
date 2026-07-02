import { useState, useEffect, useRef, useCallback } from 'react'
import { getMinFocusMinutes } from '../../hooks/useFocusSettings'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 태스크별 타이머 진행 상태 저장 — 닫았다 다시 열면 남은 시간부터 이어감
function loadTimerState(taskId, totalSeconds) {
  try {
    const raw = localStorage.getItem(`focusTimer:${taskId}`)
    if (!raw) return null
    const saved = JSON.parse(raw)
    if (typeof saved.timeLeft !== 'number' || saved.timeLeft <= 0 || saved.timeLeft > totalSeconds) return null
    return saved
  } catch {
    return null
  }
}

function StudyTimerModal({ task, onComplete, onClose }) {
  const totalSeconds = task.duration_min * 60
  const minFocusSeconds = Math.min(getMinFocusMinutes() * 60, totalSeconds)
  const savedState = loadTimerState(task.id, totalSeconds)
  const [timeLeft, setTimeLeft] = useState(savedState?.timeLeft ?? totalSeconds)
  const [running, setRunning] = useState(true)
  const [done, setDone] = useState(false)
  const [interrupted, setInterrupted] = useState(false)
  const [leaveCount, setLeaveCount] = useState(savedState?.leaveCount ?? 0)
  const wakeLockRef = useRef(null)

  // 진행 상태 저장 (완료 전까지)
  useEffect(() => {
    if (done) return
    localStorage.setItem(`focusTimer:${task.id}`, JSON.stringify({ timeLeft, leaveCount }))
  }, [task.id, timeLeft, leaveCount, done])

  const elapsed = totalSeconds - timeLeft
  const locked = !done && elapsed < minFocusSeconds

  // 앱 이탈 감지 — 화면 벗어나면 타이머 정지 (시간 안 줄어듦)
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && !done) {
        setRunning(false)
        setInterrupted(true)
        setLeaveCount((c) => c + 1)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [done])

  // Wake Lock — 타이머 도는 동안 화면 꺼짐 방지
  useEffect(() => {
    let cancelled = false
    async function acquire() {
      if (!('wakeLock' in navigator)) return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release()
        else wakeLockRef.current = lock
      } catch {
        // 배터리 절약 모드 등으로 거부될 수 있음 — 무시
      }
    }
    if (running && !done) acquire()
    return () => {
      cancelled = true
      wakeLockRef.current?.release?.()
      wakeLockRef.current = null
    }
  }, [running, done])

  useEffect(() => {
    if (!running || done) return
    if (timeLeft <= 0) {
      setDone(true)
      setRunning(false)
      return
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [running, timeLeft, done])

  const handleComplete = useCallback(() => {
    setDone(true)
    setRunning(false)
    localStorage.removeItem(`focusTimer:${task.id}`)
    onComplete()
  }, [onComplete, task.id])

  function handleResume() {
    setInterrupted(false)
    setRunning(true)
  }

  const progress = (totalSeconds - timeLeft) / totalSeconds
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)
  const lockRemaining = Math.max(0, minFocusSeconds - elapsed)

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 px-6 text-white">
      {/* 닫기 — 최소 집중 시간 전엔 잠금 */}
      <button
        onClick={locked ? undefined : onClose}
        disabled={locked}
        className={`absolute right-5 top-5 rounded-full p-2 transition ${
          locked ? 'cursor-not-allowed text-gray-700' : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        {locked ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* 태스크 정보 */}
      <div className="mb-2 flex items-center gap-2">
        {task.is_review && (
          <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-400">복습</span>
        )}
        <span className="text-xs font-medium text-gray-400">{task.duration_min}분 집중</span>
        {leaveCount > 0 && (
          <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-400">이탈 {leaveCount}회</span>
        )}
      </div>
      <h2 className="mb-10 text-center text-lg font-bold leading-snug text-white">
        {task.title}
      </h2>

      {/* 원형 타이머 */}
      <div className="relative mb-6 flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#374151" strokeWidth="8" />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={done ? '#a855f7' : '#8b5cf6'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          {done ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <>
              <span className="text-4xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
              <span className="mt-1 text-xs text-gray-500">남은 시간</span>
            </>
          )}
        </div>
      </div>

      {/* 집중 잠금 안내 */}
      {locked && !interrupted && (
        <p className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          {formatTime(lockRemaining)} 후 잠금 해제
        </p>
      )}

      {/* 이탈 경고 */}
      {interrupted && !done && (
        <div className="mb-4 w-full max-w-xs rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-red-400">집중이 끊겼어요!</p>
          <p className="mt-0.5 text-xs text-gray-400">앱을 벗어나면 타이머가 멈춰요</p>
        </div>
      )}

      {done ? (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <p className="mb-1 text-center text-sm text-gray-300">학습 완료! 정말 잘 했어요 🎉</p>
          <button
            onClick={handleComplete}
            className="w-full rounded-2xl bg-purple-600 py-4 text-base font-bold text-white transition hover:bg-purple-700 active:scale-[0.98]"
          >
            완료 체크하기
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={interrupted ? handleResume : () => setRunning((r) => !r)}
            className={`w-full rounded-2xl py-4 text-base font-semibold text-white backdrop-blur transition active:scale-[0.98] ${
              interrupted ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {interrupted ? '다시 집중하기' : running ? '일시정지' : '계속하기'}
          </button>
          <button
            onClick={locked ? undefined : handleComplete}
            disabled={locked}
            className={`w-full rounded-2xl border py-3.5 text-sm font-medium transition active:scale-[0.98] ${
              locked
                ? 'cursor-not-allowed border-white/10 text-gray-600'
                : 'border-white/20 text-gray-300 hover:border-white/40 hover:text-white'
            }`}
          >
            {locked ? `일찍 완료하기 (${formatTime(lockRemaining)} 후 가능)` : '일찍 완료하기'}
          </button>
        </div>
      )}
    </div>
  )
}

export default StudyTimerModal
