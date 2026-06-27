import { useLocation, useNavigate } from 'react-router-dom'

function GoalGeneratePage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const goal = state?.goal

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white">
          <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-gray-800">목표가 저장됐어요!</h1>
      {goal && (
        <p className="mt-2 text-sm text-gray-500">
          <span className="font-semibold text-purple-600">{goal.subject}</span> 학습 계획을 준비 중이에요
        </p>
      )}

      <div className="mt-6 w-full max-w-sm rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
          <p className="text-sm text-gray-500">AI 계획 생성 기능은 6/28 작업 예정입니다</p>
        </div>
        <p className="text-xs text-gray-400">Claude API 연동 후 일자별 학습 계획이 자동 생성됩니다</p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-md"
      >
        홈으로 이동
      </button>
    </div>
  )
}

export default GoalGeneratePage
