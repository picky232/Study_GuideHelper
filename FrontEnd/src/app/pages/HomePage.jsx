import { useState } from 'react'
import DonutChart from '../../presentation/components/home/DonutChart'
import TaskCard from '../../presentation/components/home/TaskCard'
import { mockTodayTasks, mockGoal, mockCoachingMessages } from '../../data/mockData'

function getTodayLabel() {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const now = new Date()
  const mm = now.getMonth() + 1
  const dd = now.getDate()
  const day = days[now.getDay()]
  return `${mm}월 ${dd}일 (${day})`
}

function getDday(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(deadline)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}

function getCoachingMessage(done, total) {
  if (total === 0) return mockCoachingMessages.mid
  const rate = done / total
  if (rate >= 0.8) return mockCoachingMessages.high
  if (rate >= 0.5) return mockCoachingMessages.mid
  return mockCoachingMessages.low
}

function getCoachingEmoji(done, total) {
  if (total === 0) return '💪'
  const rate = done / total
  if (rate >= 0.8) return '🔥'
  if (rate >= 0.5) return '👍'
  return '🌱'
}

function HomePage() {
  const [tasks, setTasks] = useState(mockTodayTasks)
  const done = tasks.filter((t) => t.is_done).length
  const total = tasks.length
  const dday = getDday(mockGoal.deadline)

  function handleToggle(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 그라데이션 */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pb-8 pt-6 text-white">
        <p className="text-xs text-purple-200">{getTodayLabel()}</p>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold">{mockGoal.subject}</h1>
            <p className="mt-0.5 text-sm text-purple-200">오늘도 화이팅!</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-extrabold">D-{dday}</span>
            <span className="text-xs text-purple-200">시험까지</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* 달성률 카드 */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-gray-500">오늘 달성률</p>
          <DonutChart done={done} total={total} />
        </div>

        {/* AI 코칭 메시지 */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-500 to-violet-600 p-5 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getCoachingEmoji(done, total)}</span>
            <div>
              <p className="text-xs font-semibold text-purple-200">AI 코칭 메시지</p>
              <p className="mt-1 text-sm leading-relaxed">{getCoachingMessage(done, total)}</p>
            </div>
          </div>
        </div>

        {/* 태스크 체크리스트 */}
        <div className="pb-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">오늘 학습 목록</p>
            <span className="text-xs text-gray-400">{done}/{total} 완료</span>
          </div>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
