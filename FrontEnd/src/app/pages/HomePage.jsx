import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DonutChart from '../../presentation/components/home/DonutChart'
import TaskCard from '../../presentation/components/home/TaskCard'
import GoalSelectorModal from '../../presentation/components/home/GoalSelectorModal'
import { useGoal } from '../../presentation/hooks/useGoal'
import { useSchedule } from '../../presentation/hooks/useSchedule'
import { mockCoachingMessages } from '../../data/mockData'

function getTodayLabel() {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const now = new Date()
  return `${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

function getDday(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(deadline) - today) / (1000 * 60 * 60 * 24))
}

function getCoachingMessage(done, total) {
  if (total === 0) return '오늘 학습 계획을 설정해보세요!'
  const rate = done / total
  if (rate >= 0.8) return mockCoachingMessages.high
  if (rate >= 0.5) return mockCoachingMessages.mid
  return mockCoachingMessages.low
}

function getCoachingEmoji(done, total) {
  if (total === 0) return '📚'
  const rate = done / total
  if (rate >= 0.8) return '🔥'
  if (rate >= 0.5) return '👍'
  return '🌱'
}

function HomePage() {
  const navigate = useNavigate()
  const { goal, goals, loading: goalLoading, selectGoal, deleteGoal } = useGoal()
  const { schedules, loading: schedLoading, toggleDone } = useSchedule(getTodayDate())
  const [showSelector, setShowSelector] = useState(false)

  const done = schedules.filter((s) => s.is_done).length
  const total = schedules.length
  const dday = goal ? getDday(goal.deadline) : null

  if (goalLoading || schedLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pb-8 pt-6 text-white">
        <p className="text-xs text-purple-200">{getTodayLabel()}</p>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <button
              onClick={() => goals.length > 1 && setShowSelector(true)}
              className="flex items-center gap-1.5 text-left"
            >
              <h1 className="text-xl font-bold">{goal ? goal.subject : '학습 설계 도우미'}</h1>
              {goals.length > 1 && (
                <svg className="h-4 w-4 text-purple-200 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              )}
            </button>
            <p className="mt-0.5 text-sm text-purple-200">
              {goal ? (goals.length > 1 ? `목표 ${goals.length}개 중 선택됨` : '오늘도 화이팅!') : '목표를 설정하고 시작해보세요'}
            </p>
          </div>
          {dday !== null && (
            <div className="flex flex-col items-center rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm">
              <span className="text-2xl font-extrabold">D-{dday}</span>
              <span className="text-xs text-purple-200">시험까지</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* 목표 없을 때 */}
        {!goal && (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="mb-3 text-4xl">🎯</p>
            <h2 className="mb-1 text-base font-bold text-gray-800">아직 학습 목표가 없어요</h2>
            <p className="mb-4 text-sm text-gray-400">목표를 설정하면 AI가 맞춤 계획을 만들어줘요</p>
            <button
              onClick={() => navigate('/goal/new')}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3 text-sm font-semibold text-white"
            >
              목표 설정하기
            </button>
          </div>
        )}

        {/* 달성률 카드 */}
        {goal && (
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-500">오늘 달성률</p>
            <DonutChart done={done} total={total} />
          </div>
        )}

        {/* AI 코칭 메시지 */}
        {goal && (
          <div className="rounded-3xl bg-gradient-to-r from-purple-500 to-violet-600 p-5 text-white shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getCoachingEmoji(done, total)}</span>
              <div>
                <p className="text-xs font-semibold text-purple-200">AI 코칭 메시지</p>
                <p className="mt-1 text-sm leading-relaxed">{getCoachingMessage(done, total)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 태스크 체크리스트 */}
        <div className="pb-6">
          {goal && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-600">오늘 학습 목록</p>
                <span className="text-xs text-gray-400">{done}/{total} 완료</span>
              </div>
              {total === 0 ? (
                <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                  <p className="text-sm text-gray-400">오늘 예정된 학습이 없어요 🎉</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {schedules.map((s) => (
                    <TaskCard
                      key={s.id}
                      task={{
                        id: s.id,
                        title: s.title,
                        duration_min: s.duration_min,
                        is_done: s.is_done,
                        is_review: s.is_review,
                      }}
                      onToggle={() => toggleDone(s.id, s.is_done)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <button
            onClick={() => navigate('/goal/new')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 py-4 text-sm font-medium text-purple-400 transition hover:border-purple-400 hover:text-purple-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {goal ? '새 학습 목표 추가' : '목표 설정하기'}
          </button>
        </div>
      </div>

      {showSelector && (
        <GoalSelectorModal
          goals={goals}
          selectedGoal={goal}
          onSelect={selectGoal}
          onClose={() => setShowSelector(false)}
          onDelete={deleteGoal}
        />
      )}
    </div>
  )
}

export default HomePage
