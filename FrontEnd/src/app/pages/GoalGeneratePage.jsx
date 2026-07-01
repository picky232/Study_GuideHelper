import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../../infrastructure/api/client'

function LoadingScreen() {
  const messages = [
    'AI가 학습 계획을 설계 중이에요...',
    '최적 일정을 계산하고 있어요...',
    '망각곡선 복습 일정을 추가 중이에요...',
    '거의 다 됐어요!',
  ]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % messages.length), 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 animate-pulse rounded-3xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white">
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
          </svg>
        </div>
      </div>
      <h1 className="text-xl font-bold text-gray-800">AI 계획 생성 중</h1>
      <p className="mt-2 min-h-[20px] text-sm text-gray-500">{messages[idx]}</p>
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function PreviewScreen({ tasks, goal, onConfirm, onRetry, loading }) {
  const grouped = tasks.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = []
    acc[t.date].push(t)
    return acc
  }, {})
  const dates = Object.keys(grouped).sort()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pb-6 pt-8 text-white">
        <h1 className="text-xl font-bold">AI 학습 계획 완성!</h1>
        <p className="mt-0.5 text-sm text-purple-200">
          {goal?.subject} · 총 {tasks.length}개 태스크
        </p>
        <div className="mt-3 flex gap-2">
          <div className="rounded-xl bg-white/20 px-3 py-1.5 text-xs">
            학습 {tasks.filter((t) => !t.is_review).length}개
          </div>
          <div className="rounded-xl bg-white/20 px-3 py-1.5 text-xs">
            복습 {tasks.filter((t) => t.is_review).length}개
          </div>
          <div className="rounded-xl bg-white/20 px-3 py-1.5 text-xs">
            {dates.length}일
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 pt-4">
        {dates.slice(0, 14).map((date) => (
          <div key={date} className="mb-3">
            <p className="mb-1.5 text-xs font-semibold text-gray-400">{date}</p>
            <div className="flex flex-col gap-1.5">
              {grouped[date].map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    t.is_review ? 'border-orange-100 bg-orange-50' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className={`h-2 w-2 flex-shrink-0 rounded-full ${t.is_review ? 'bg-orange-400' : 'bg-purple-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.duration_min}분</p>
                  </div>
                  {t.is_review && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-500">복습</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {dates.length > 14 && (
          <p className="mb-4 text-center text-xs text-gray-400">+{dates.length - 14}일 더 있음 (캘린더에서 전체 확인)</p>
        )}

        <div className="flex flex-col gap-2 pb-8 pt-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? '저장 중...' : '이 계획으로 시작하기 🚀'}
          </button>
          <button
            onClick={onRetry}
            className="w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-200 active:scale-[0.98]"
          >
            다시 생성하기
          </button>
        </div>
      </div>
    </div>
  )
}

function GoalGeneratePage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const goal = state?.goal

  const [status, setStatus] = useState('loading')
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function generatePlan() {
    if (!goal) { navigate('/goal/new'); return }
    setStatus('loading')
    setError('')
    try {
      const { data } = await apiClient.post('/generate', {
        goalId: goal.id,
        subject: goal.subject,
        examType: goal.exam_type,
        examFormat: goal.exam_format,
        deadline: goal.deadline,
        dailyHours: goal.daily_hours,
        completedRange: goal.completed_range,
        weakPoints: goal.weak_points,
      })
      setTasks(data.tasks)
      setStatus('preview')
    } catch (err) {
      setError(err.response?.data?.error || err.message)
      setStatus('error')
    }
  }

  useEffect(() => { generatePlan() }, [])

  function handleConfirm() {
    setSaving(true)
    navigate('/')
  }

  if (status === 'loading') return <LoadingScreen />

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="text-lg font-bold text-gray-800">계획 생성 실패</h1>
        <p className="mt-2 text-sm text-red-500">{error}</p>
        <button
          onClick={generatePlan}
          className="mt-6 rounded-xl bg-purple-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-[0.98]"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return <PreviewScreen tasks={tasks} goal={goal} onConfirm={handleConfirm} onRetry={generatePlan} loading={saving} />
}

export default GoalGeneratePage
