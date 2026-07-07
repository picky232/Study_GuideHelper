import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../infrastructure/api/client'

const EXAM_TYPES = ['자격증', '수능', '내신', '공무원', '어학', '기타']
const EXAM_FORMATS = ['필기', '실기', '필기+실기']
const DAILY_HOURS = [1, 2, 3, 4, 5, 6]
const EXAM_FORMAT_TYPES = ['자격증', '공무원', '기타']

function getDday(deadline) {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(deadline)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step === current
                ? 'bg-purple-600 text-white'
                : step < current
                ? 'bg-purple-200 text-purple-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step < current ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : step}
          </div>
          {step < 3 && <div className={`h-0.5 w-8 ${step < current ? 'bg-purple-300' : 'bg-gray-100'}`} />}
        </div>
      ))}
    </div>
  )
}

function GoalNewPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    subject: '',
    examType: '',
    examFormat: '필기',
    deadline: '',
    dailyHours: null,
    completedRange: '',
    weakPoints: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  function validateStep() {
    if (step === 1) {
      if (!form.subject.trim()) return '과목명을 입력해주세요'
      if (!form.examType) return '시험 종류를 선택해주세요'
    }
    if (step === 2) {
      if (!form.deadline) return '마감일을 선택해주세요'
      const dday = getDday(form.deadline)
      if (dday <= 0) return '마감일은 오늘 이후 날짜여야 합니다'
      if (!form.dailyHours) return '하루 공부시간을 선택해주세요'
    }
    return null
  }

  function handleNext() {
    const err = validateStep()
    if (err) { setError(err); return }
    setStep((s) => s + 1)
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const { data } = await apiClient.post('/goal', {
        subject: form.subject,
        examType: form.examType,
        examFormat: form.examFormat,
        deadline: form.deadline,
        dailyHours: form.dailyHours,
        completedRange: form.completedRange,
        weakPoints: form.weakPoints,
      })
      navigate('/goal/generate', { state: { goal: data.goal } })
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const dday = getDday(form.deadline)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pb-6 pt-8 text-white">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-purple-200 transition hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          뒤로
        </button>
        <h1 className="text-xl font-bold">학습 목표 설정</h1>
        <p className="mt-0.5 text-sm text-purple-200">AI가 맞춤 학습 계획을 설계합니다</p>
        <StepIndicator current={step} />
      </div>

      <div className="mx-auto w-full max-w-sm flex-1 px-5 pt-4">

        {/* STEP 1 — 시험 정보 */}
        {step === 1 && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-gray-800">무엇을 준비하나요?</h2>
            <p className="mb-5 text-xs text-gray-400">과목과 시험 종류를 알려주세요</p>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">과목명</label>
              <input
                placeholder="예: 정보처리기사, 수학, 영어"
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-gray-500">시험 종류</label>
              <div className="grid grid-cols-3 gap-2">
                {EXAM_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      update('examType', type)
                      if (!EXAM_FORMAT_TYPES.includes(type)) update('examFormat', null)
                      else update('examFormat', '필기')
                    }}
                    className={`rounded-xl py-2.5 text-sm font-medium transition ${
                      form.examType === type
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {EXAM_FORMAT_TYPES.includes(form.examType) && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-500">시험 유형</label>
                <div className="grid grid-cols-3 gap-2">
                  {EXAM_FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => update('examFormat', fmt)}
                      className={`rounded-xl py-2.5 text-sm font-medium transition ${
                        form.examFormat === fmt
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — 일정 */}
        {step === 2 && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-gray-800">언제까지, 얼마나?</h2>
            <p className="mb-5 text-xs text-gray-400">마감일과 하루 공부시간을 설정하세요</p>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">시험 마감일</label>
              <input
                type="date"
                value={form.deadline}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                onChange={(e) => update('deadline', e.target.value)}
                className="w-full min-w-0 box-border rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
              {dday > 0 && (
                <p className="mt-1.5 text-xs font-semibold text-purple-500">D-{dday} · {dday}일 남았어요</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-500">하루 공부시간</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {DAILY_HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => update('dailyHours', h)}
                    className={`rounded-xl py-2.5 text-sm font-medium transition ${
                      form.dailyHours === h
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {h}시간
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                <span className="text-xs text-gray-500 flex-shrink-0">직접 입력</span>
                <button type="button" onClick={() => update('dailyHours', Math.max(0.5, (form.dailyHours || 0) - 0.5))} className="rounded-lg px-1 text-gray-400 text-lg font-bold transition hover:bg-gray-200 hover:text-gray-600">−</button>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={form.dailyHours || ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    if (!isNaN(v) && v > 0 && v <= 24) update('dailyHours', v)
                  }}
                  className="flex-1 text-center text-sm font-semibold text-gray-800 bg-transparent outline-none"
                />
                <span className="text-xs text-gray-500">시간</span>
                <button type="button" onClick={() => update('dailyHours', Math.min(24, (form.dailyHours || 0) + 0.5))} className="rounded-lg px-1 text-gray-400 text-lg font-bold transition hover:bg-gray-200 hover:text-gray-600">+</button>
              </div>
              {form.dailyHours && dday > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  총 <span className="font-semibold text-purple-600">{form.dailyHours * dday}시간</span> 학습 예정
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — 현재 학습 상황 */}
        {step === 3 && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-gray-800">현재 학습 상황을 알려주세요</h2>
            <p className="mb-5 text-xs text-gray-400">AI가 남은 단원만 설계하고, 완료한 건 복습으로 배치합니다</p>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                완료한 단원 <span className="font-normal text-gray-400">(선택)</span>
              </label>
              <textarea
                placeholder={`예: UI 테스트, 응용프로그래밍 언어 활용\n예: 극한과 연속, 미분법까지 완료\n예: 아직 시작 안 함`}
                value={form.completedRange}
                onChange={(e) => update('completedRange', e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
              <p className="mt-1 text-xs text-gray-400">여기까지 끝냈으니 다음 단원부터 + 해당 단원 복습 계획 자동 생성</p>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                약점 단원 <span className="font-normal text-gray-400">(선택)</span>
              </label>
              <textarea
                placeholder={`예: 데이터베이스 정규화, SQL 조인\n예: 적분 응용 문제, 급수`}
                value={form.weakPoints}
                onChange={(e) => update('weakPoints', e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
              <p className="mt-1 text-xs text-gray-400">해당 단원 학습 시간 늘리고 복습 주기 단축</p>
            </div>

            {/* 요약 */}
            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="mb-2 text-xs font-semibold text-purple-500">입력 요약</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>과목: <span className="font-semibold">{form.subject}</span> ({form.examType} / {form.examFormat})</p>
                <p>마감: <span className="font-semibold">{form.deadline}</span> (D-{dday})</p>
                <p>하루: <span className="font-semibold">{form.dailyHours}시간</span> · 총 {form.dailyHours * dday}시간</p>
              </div>
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="mt-3 rounded-xl bg-red-50 px-4 py-3">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* 버튼 */}
        <div className="pb-8 pt-4">
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
            >
              다음 단계
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'AI 계획 생성 중...' : 'AI로 계획 생성하기 ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoalNewPage
