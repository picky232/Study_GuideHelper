import { useState, useEffect, useCallback } from 'react'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function StudyTimerModal({ task, onComplete, onClose }) {
  const totalSeconds = task.duration_min * 60
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [running, setRunning] = useState(true)
  const [done, setDone] = useState(false)

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
    onComplete()
  }, [onComplete])

  const progress = (totalSeconds - timeLeft) / totalSeconds
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 px-6 text-white">
      {/* 닫기 */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-white"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 태스크 정보 */}
      <div className="mb-2 flex items-center gap-2">
        {task.is_review && (
          <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-400">복습</span>
        )}
        <span className="text-xs font-medium text-gray-400">{task.duration_min}분 집중</span>
      </div>
      <h2 className="mb-10 text-center text-lg font-bold leading-snug text-white">
        {task.title}
      </h2>

      {/* 원형 타이머 */}
      <div className="relative mb-10 flex items-center justify-center">
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

      {done ? (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <p className="mb-1 text-center text-sm text-gray-300">학습 완료! 정말 잘 했어요 🎉</p>
          <button
            onClick={handleComplete}
            className="w-full rounded-2xl bg-purple-600 py-4 text-base font-bold text-white"
          >
            완료 체크하기
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-full rounded-2xl bg-white/10 py-4 text-base font-semibold text-white backdrop-blur"
          >
            {running ? '일시정지' : '계속하기'}
          </button>
          <button
            onClick={handleComplete}
            className="w-full rounded-2xl border border-white/20 py-3.5 text-sm font-medium text-gray-300"
          >
            일찍 완료하기
          </button>
        </div>
      )}
    </div>
  )
}

export default StudyTimerModal
