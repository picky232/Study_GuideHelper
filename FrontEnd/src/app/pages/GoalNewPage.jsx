import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../infrastructure/api/client'

const EXAM_TYPES = ['자격증', '수능', '내신', '공무원', '어학', '기타']
const DAILY_HOURS = [1, 2, 3, 4, 5, 6]

function getDday(deadline) {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(deadline)
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  return diff
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
    deadline: '',
    dailyHours: null,
    studyRange: '',
    currentLevel: 50,
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
        deadline: form.deadline,
        dailyHours: form.dailyHours,
        studyRange: form.studyRange,
        currentLevel: form.currentLevel,
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
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-purple-200">
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
        {/* STEP 1 */}
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

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-500">시험 종류</label>
              <div className="grid grid-cols-3 gap-2">
                {EXAM_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update('examType', type)}
                    className={`rounded-xl py-2.5 text-sm font-medium transition ${
                      form.examType === type
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
              {dday > 0 && (
                <p className="mt-1.5 text-xs font-semibold text-purple-500">D-{dday} · {dday}일 남았어요</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-500">하루 공부시간</label>
              <div className="grid grid-cols-3 gap-2">
                {DAILY_HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => update('dailyHours', h)}
                    className={`rounded-xl py-2.5 text-sm font-medium transition ${
                      form.dailyHours === h
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {h}시간
                  </button>
                ))}
              </div>
              {form.dailyHours && dday > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  총 <span className="font-semibold text-purple-600">{form.dailyHours * dday}시간</span> 학습 예정
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-gray-800">현재 상태를 알려주세요</h2>
            <p className="mb-5 text-xs text-gray-400">AI가 최적 계획을 설계합니다</p>

            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">학습 범위 (선택)</label>
              <textarea
                placeholder="예: 1~5과목 전체, 미적분·확통, 기출 5개년"
                value={form.studyRange}
                onChange={(e) => update('studyRange', e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-semibold text-gray-500">
                현재 수준{' '}
                <span className="text-purple-600 font-bold">{form.currentLevel}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.currentLevel}
                onChange={(e) => update('currentLevel', Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>처음 시작</span>
                <span>절반 완료</span>
                <span>거의 완성</span>
              </div>
            </div>

            {/* 요약 */}
            <div className="mt-5 rounded-2xl bg-purple-50 p-4">
              <p className="mb-2 text-xs font-semibold text-purple-500">입력 요약</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>과목: <span className="font-semibold">{form.subject}</span> ({form.examType})</p>
                <p>마감: <span className="font-semibold">{form.deadline}</span> (D-{dday})</p>
                <p>하루: <span className="font-semibold">{form.dailyHours}시간</span></p>
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
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98]"
            >
              다음 단계
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60"
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
