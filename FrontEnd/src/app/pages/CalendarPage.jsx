import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useCalendar } from '../../presentation/hooks/useCalendar'

function DayDetailModal({ date, schedules, onClose, onToggle }) {
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일`
  const done = schedules.filter((s) => s.is_done).length

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white px-5 pb-10 pt-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">{label}</h2>
            <p className="text-xs text-gray-400">{done}/{schedules.length} 완료</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {schedules.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">이날 학습 없음</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {schedules.map((s) => (
              <button
                key={s.id}
                onClick={() => onToggle(s)}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                  s.is_done ? 'border-purple-100 bg-purple-50 hover:bg-purple-100' : 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  s.is_done ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                }`}>
                  {s.is_done && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${s.is_done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-400">{s.duration_min}분</p>
                </div>
                {s.is_review && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-500">복습</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CalendarPage() {
  const today = new Date()
  const [activeDate, setActiveDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(null)

  const year = activeDate.getFullYear()
  const month = activeDate.getMonth() + 1
  const { scheduleMap, loading, toggleDone } = useCalendar(year, month)

  function toKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  function tileContent({ date, view }) {
    if (view !== 'month') return null
    const key = toKey(date)
    const items = scheduleMap[key]
    if (!items || items.length === 0) return null

    const total = items.length
    const done = items.filter((s) => s.is_done).length
    const hasReview = items.some((s) => s.is_review)
    const allDone = done === total

    return (
      <div className="flex flex-col items-center gap-0.5 mt-0.5">
        <div className="flex gap-0.5">
          {hasReview && <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
          <div className={`h-1.5 w-1.5 rounded-full ${allDone ? 'bg-purple-500' : done > 0 ? 'bg-purple-300' : 'bg-gray-300'}`} />
        </div>
        <span className="text-[10px] text-gray-400">{done}/{total}</span>
      </div>
    )
  }

  function tileClassName({ date, view }) {
    if (view !== 'month') return ''
    const key = toKey(date)
    const items = scheduleMap[key]
    if (!items || items.length === 0) return ''
    const allDone = items.every((s) => s.is_done)
    return allDone ? 'day-all-done' : ''
  }

  const selectedSchedules = selectedDate ? (scheduleMap[toKey(selectedDate)] || []) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pb-6 pt-8 text-white">
        <h1 className="text-xl font-bold">학습 캘린더</h1>
        <p className="mt-0.5 text-sm text-purple-200">날짜를 눌러 상세 학습 내용 확인</p>
      </div>

      <div className="mx-auto max-w-md px-4 pt-4">
        {/* 범례 */}
        <div className="mb-3 flex items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-500">전체 완료</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-purple-300" />
            <span className="text-xs text-gray-500">진행 중</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            <span className="text-xs text-gray-500">복습</span>
          </div>
        </div>

        {/* 캘린더 */}
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            </div>
          ) : (
            <Calendar
              value={activeDate}
              onActiveStartDateChange={({ activeStartDate }) => setActiveDate(activeStartDate)}
              onClickDay={(date) => setSelectedDate(date)}
              tileContent={tileContent}
              tileClassName={tileClassName}
              locale="ko-KR"
              calendarType="gregory"
              className="w-full border-none"
            />
          )}
        </div>

        {/* 이번 달 요약 */}
        {!loading && (() => {
          const allSchedules = Object.values(scheduleMap).flat()
          return (
            <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-gray-600">{month}월 학습 현황</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '총 태스크', value: allSchedules.length },
                  { label: '완료', value: allSchedules.filter((s) => s.is_done).length, color: 'text-purple-600' },
                  { label: '복습', value: allSchedules.filter((s) => s.is_review).length, color: 'text-orange-500' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-gray-50 p-3 text-center">
                    <p className={`text-xl font-bold ${item.color || 'text-gray-800'}`}>{item.value}</p>
                    <p className="text-xs text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* 날짜 상세 모달 */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          schedules={selectedSchedules}
          onClose={() => setSelectedDate(null)}
          onToggle={toggleDone}
        />
      )}

      <style>{`
        .react-calendar { width: 100%; border: none; font-family: inherit; }
        .react-calendar__tile { padding: 6px 4px 20px; position: relative; border-radius: 12px; }
        .react-calendar__tile:hover { background: #f3f0ff; }
        .react-calendar__tile--active { background: #7c3aed !important; color: white; border-radius: 12px; }
        .react-calendar__tile--now { background: #ede9fe; border-radius: 12px; }
        .react-calendar__navigation button { border-radius: 8px; font-weight: 600; }
        .react-calendar__navigation button:hover { background: #f3f0ff; }
        .day-all-done { background: #f3f0ff; }
      `}</style>
    </div>
  )
}

export default CalendarPage
