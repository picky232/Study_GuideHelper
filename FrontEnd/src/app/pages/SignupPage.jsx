import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../presentation/hooks/AuthContext'

function SignupPage() {
  const { signUp } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(form)
      setEmailSent(true)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-6 pb-12 pt-16 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">이메일을 확인해주세요</h1>
          <p className="mt-1 text-sm text-purple-200">인증 메일이 발송되었습니다</p>
        </div>
        <div className="mx-auto w-full max-w-sm flex-1 px-5 -mt-6">
          <div className="rounded-3xl bg-white p-6 shadow-lg text-center">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-purple-600">{form.email}</span>으로<br />
              인증 링크를 보냈어요.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              메일함을 확인하고 링크를 클릭하면<br />가입이 완료됩니다.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              스팸함도 확인해보세요.
            </p>
            <Link
              to="/login"
              className="mt-6 block w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              로그인 페이지로
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-6 pb-12 pt-16 text-center text-white">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white">
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">학습 설계 도우미</h1>
        <p className="mt-1 text-sm text-purple-200">AI가 설계하는 맞춤 학습 플랜</p>
      </div>

      {/* 폼 카드 */}
      <div className="mx-auto w-full max-w-sm flex-1 px-5 -mt-6">
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="mb-5 text-lg font-bold text-gray-800">회원가입</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">이름</label>
              <input
                name="name"
                placeholder="홍길동"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">이메일</label>
              <input
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">비밀번호</label>
              <input
                name="password"
                type="password"
                placeholder="8자 이상 입력"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                required
              />
              <p className="mt-1.5 text-xs text-gray-400">영문·숫자 포함 8자 이상</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? '가입 중...' : '시작하기'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-purple-600 transition hover:text-purple-800 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
