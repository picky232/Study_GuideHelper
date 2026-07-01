import { useState } from 'react'
import apiClient from '../../../infrastructure/api/client'

function getDday(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(deadline) - today) / (1000 * 60 * 60 * 24))
}

function GoalSelectorModal({ goals, selectedGoal, onSelect, onClose, onDelete, onAdd }) {
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  async function handleDelete(e, goalId) {
    e.stopPropagation()
    if (confirmId !== goalId) {
      setConfirmId(goalId)
      return
    }
    setDeletingId(goalId)
    try {
      await apiClient.delete(`/goal?id=${goalId}`)
      onDelete(goalId)
      setConfirmId(null)
    } catch (err) {
      alert(err.response?.data?.error || '삭제 실패')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { setConfirmId(null); onClose() }} />

      <div className="relative w-full max-w-md rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">학습 목표 선택</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {goals.map((g) => {
            const dday = getDday(g.deadline)
            const isSelected = selectedGoal?.id === g.id
            const isConfirming = confirmId === g.id
            const isDeleting = deletingId === g.id

            return (
              <div
                key={g.id}
                className={`flex items-center gap-2 rounded-2xl border p-4 transition ${
                  isSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/40'
                }`}
              >
                {/* 목표 선택 영역 */}
                <button
                  onClick={() => { onSelect(g); onClose() }}
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <div>
                    <p className={`text-sm font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                      {g.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{g.exam_type} · 하루 {g.daily_hours}시간</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      dday > 0 ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {dday > 0 ? `D-${dday}` : '마감'}
                    </span>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => handleDelete(e, g.id)}
                  disabled={isDeleting}
                  className={`flex-shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                    isConfirming
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }`}
                >
                  {isDeleting ? '...' : isConfirming ? '확인' : '삭제'}
                </button>
              </div>
            )
          })}
        </div>

        {confirmId && (
          <p className="mt-3 text-center text-xs text-red-400">
            삭제 시 관련 일정도 모두 삭제됩니다. 한 번 더 누르면 삭제됩니다.
          </p>
        )}

        <button
          onClick={() => { onClose(); onAdd() }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 py-3.5 text-sm font-medium text-purple-400 transition hover:border-purple-400 hover:text-purple-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          새 학습 목표 추가
        </button>
      </div>
    </div>
  )
}

export default GoalSelectorModal
