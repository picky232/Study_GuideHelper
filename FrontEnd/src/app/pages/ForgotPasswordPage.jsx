import { useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../infrastructure/api/client'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiClient.post('/auth/reset-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || '이메일 발송에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-6 pb-12 pt-16 text-center text-white">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white">
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="mt-1 text-sm text-purple-200">가입한 이메일로 재설정 링크를 보내드려요</p>
      </div>

      <div className="mx-auto w-full max-w-sm flex-1 px-5 -mt-6">
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800">이메일을 확인해주세요</p>
                <p className="mt-1 text-sm text-gray-400">
                  <span className="font-semibold text-purple-600">{email}</span>로<br />
                  비밀번호 재설정 링크를 보냈어요
                </p>
              </div>
              <Link
                to="/login"
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-5 text-lg font-bold text-gray-800">이메일 입력</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">가입한 이메일</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                    required
                  />
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
                  {loading ? '전송 중...' : '재설정 링크 보내기'}
                </button>
              </form>
            </>
          )}

          {!sent && (
            <p className="mt-5 text-center text-sm text-gray-400">
              <Link to="/login" className="font-semibold text-purple-600 transition hover:text-purple-800 hover:underline">
                로그인으로 돌아가기
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
