import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DonutChart from '../../presentation/components/home/DonutChart'
import TaskCard from '../../presentation/components/home/TaskCard'
import GoalManagerModal from '../../presentation/components/home/GoalManagerModal'
import StudyTimerModal from '../../presentation/components/home/StudyTimerModal'
import { useGoal } from '../../presentation/hooks/useGoal'
import { useSchedulesByGoals } from '../../presentation/hooks/useSchedulesByGoals'
import { mockCoachingMessages } from '../../data/mockData'
import apiClient from '../../infrastructure/api/client'

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

function GoalSection({ goal, schedules, onStart }) {
  const done = schedules.filter((s) => s.is_done).length
  const total = schedules.length
  const dday = getDday(goal.deadline)

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      {/* 목표 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-gray-800">{goal.subject}</p>
          <p className="mt-0.5 text-xs text-gray-400">{goal.exam_type} · {done}/{total} 완료</p>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className="text-xs font-semibold text-purple-600">
              {Math.round((done / total) * 100)}%
            </span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            dday > 0 ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-500'
          }`}>
            {dday > 0 ? `D-${dday}` : '마감'}
          </span>
        </div>
      </div>

      {/* 학습 목록 */}
      <div className="flex flex-col gap-2 px-4 py-3">
        {total === 0 ? (
          <p className="py-3 text-center text-sm text-gray-400">오늘 예정된 학습이 없어요 🎉</p>
        ) : (
          schedules.map((s) => (
            <TaskCard key={s.id} task={s} onStart={onStart} />
          ))
        )}
      </div>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const today = useMemo(() => getTodayDate(), [])
  const { goals, loading: goalLoading, deleteGoal } = useGoal()
  const { schedulesByGoal, loading: schedLoading, updateDone } = useSchedulesByGoals(
    goals,
    today,
    !goalLoading
  )
  const [showManager, setShowManager] = useState(false)
  const [timerTask, setTimerTask] = useState(null)

  const allSchedules = Object.values(schedulesByGoal).flat()
  const totalDone = allSchedules.filter((s) => s.is_done).length
  const totalTasks = allSchedules.length

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
            <h1 className="text-xl font-bold">학습 설계 도우미</h1>
            <p className="mt-0.5 text-sm text-purple-200">
              {goals.length > 0
                ? `목표 ${goals.length}개 · 오늘 ${totalDone}/${totalTasks} 완료`
                : '목표를 설정하고 시작해보세요'}
            </p>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-white/20 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            목표 관리
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-6">
        {/* 목표 없을 때 */}
        {goals.length === 0 && (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="mb-3 text-4xl">🎯</p>
            <h2 className="mb-1 text-base font-bold text-gray-800">아직 학습 목표가 없어요</h2>
            <p className="mb-4 text-sm text-gray-400">목표를 설정하면 AI가 맞춤 계획을 만들어줘요</p>
            <button
              onClick={() => navigate('/goal/new')}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
            >
              목표 설정하기
            </button>
          </div>
        )}

        {/* 전체 달성률 + AI 코칭 (목표 있을 때) */}
        {goals.length > 0 && (
          <>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-gray-500">오늘 전체 달성률</p>
              <DonutChart done={totalDone} total={totalTasks} />
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-purple-500 to-violet-600 p-5 text-white shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getCoachingEmoji(totalDone, totalTasks)}</span>
                <div>
                  <p className="text-xs font-semibold text-purple-200">AI 코칭 메시지</p>
                  <p className="mt-1 text-sm leading-relaxed">{getCoachingMessage(totalDone, totalTasks)}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 목표별 학습 섹션 */}
        {goals.map((g) => (
          <GoalSection
            key={g.id}
            goal={g}
            schedules={schedulesByGoal[g.id] || []}
            onStart={(task) => setTimerTask(task)}
          />
        ))}
      </div>

      {timerTask && (
        <StudyTimerModal
          task={timerTask}
          onComplete={async () => {
            updateDone(timerTask.id, timerTask.goal_id, true)
            try {
              await apiClient.patch('/schedule', { id: timerTask.id, is_done: true })
              if (!timerTask.is_review && timerTask.goal_id) {
                await apiClient.post('/review', {
                  goalId: timerTask.goal_id,
                  completedDate: getTodayDate(),
                  title: timerTask.title,
                  durationMin: timerTask.duration_min,
                })
              }
            } catch (err) {
              console.error('완료 처리 실패:', err)
            }
            setTimerTask(null)
          }}
          onClose={() => setTimerTask(null)}
        />
      )}

      {showManager && (
        <GoalManagerModal
          goals={goals}
          onClose={() => setShowManager(false)}
          onDelete={deleteGoal}
          onAdd={() => { setShowManager(false); navigate('/goal/new') }}
        />
      )}
    </div>
  )
}

export default HomePage
