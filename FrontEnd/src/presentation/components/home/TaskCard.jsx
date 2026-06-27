function TaskCard({ task, onToggle }) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${
        task.is_done
          ? 'border-purple-100 bg-purple-50'
          : 'border-gray-100 bg-white shadow-sm'
      }`}
    >
      {/* 체크 버튼 */}
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          task.is_done
            ? 'border-purple-500 bg-purple-500'
            : 'border-gray-300 bg-white'
        }`}
      >
        {task.is_done && (
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* 내용 */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span
          className={`text-sm font-medium leading-snug transition-colors ${
            task.is_done ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}
        >
          {task.title}
        </span>
        <span className="text-xs text-gray-400">{task.duration_min}분</span>
      </div>

      {/* 복습 배지 */}
      {task.is_review && (
        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-500">
          복습
        </span>
      )}
    </button>
  )
}

export default TaskCard
