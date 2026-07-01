import { useFeedback } from '../../presentation/hooks/useFeedback'

function RateBar({ rate }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-purple-500 transition-all duration-500"
        style={{ width: `${rate}%` }}
      />
    </div>
  )
}

function FeedbackPage() {
  const { data, loading, error } = useFeedback()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <p className="text-center text-sm text-red-400">{error}</p>
      </div>
    )
  }

  const { achievementRate, done, total, doneMin, totalMin, dailyStats, coaching, period } = data

  const doneHours = Math.round((doneMin / 60) * 10) / 10
  const totalHours = Math.round((totalMin / 60) * 10) / 10

  const rateColor =
    achievementRate >= 80 ? 'text-purple-600' :
    achievementRate >= 50 ? 'text-amber-500' : 'text-red-400'

  const days = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pb-6 pt-8 text-white">
        <h1 className="text-xl font-bold">학습 피드백</h1>
        <p className="mt-0.5 text-sm text-purple-200">
          {period.start.slice(5).replace('-', '/')} ~ {period.end.slice(5).replace('-', '/')} 주간 리포트
        </p>
      </div>

      <div className="mx-auto max-w-sm space-y-4 px-5 pt-5 pb-10">

        {/* 달성률 요약 */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-gray-600">이번 주 달성률</p>
          <div className="flex items-end gap-4">
            <p className={`text-5xl font-bold ${rateColor}`}>
              {achievementRate}<span className="text-2xl">%</span>
            </p>
            <div className="flex-1 pb-2">
              <RateBar rate={achievementRate} />
              <p className="mt-1.5 text-xs text-gray-400">
                {done}/{total} 태스크 · {doneHours}h/{totalHours}h
              </p>
            </div>
          </div>
        </div>

        {/* AI 코칭 메시지 */}
        {coaching && (
          <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-violet-50 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-purple-600">AI 코치</p>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{coaching}</p>
          </div>
        )}

        {/* 일별 달성률 */}
        {dailyStats.length > 0 && (
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-600">일별 달성률</p>
            <div className="space-y-2.5">
              {dailyStats.map((stat) => {
                const d = new Date(stat.date + 'T00:00:00')
                const label = `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`
                return (
                  <div key={stat.date} className="flex items-center gap-3">
                    <span className="w-14 flex-shrink-0 text-xs text-gray-400">{label}</span>
                    <div className="flex-1">
                      <RateBar rate={stat.rate} />
                    </div>
                    <span className={`w-8 text-right text-xs font-semibold ${
                      stat.rate >= 80 ? 'text-purple-600' :
                      stat.rate >= 50 ? 'text-amber-500' : 'text-gray-400'
                    }`}>{stat.rate}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {total === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400">이번 주 학습 데이터가 없어요</p>
            <p className="mt-1 text-xs text-gray-300">학습을 시작하면 피드백이 표시됩니다</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default FeedbackPage
