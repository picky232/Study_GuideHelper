import { useFcm } from '../../presentation/hooks/useFcm'
import { useAuth } from '../../presentation/hooks/AuthContext'

function SettingsPage() {
  const { permission, loading, error, requestPermission } = useFcm()
  const { user, logout } = useAuth()

  const permissionLabel = {
    granted: '알림 허용됨',
    denied: '알림 차단됨 (브라우저 설정에서 변경)',
    default: '알림 미설정',
  }[permission] || '알림 미설정'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pb-6 pt-8 text-white">
        <h1 className="text-xl font-bold">설정</h1>
        <p className="mt-0.5 text-sm text-purple-200">알림 및 계정 관리</p>
      </div>

      <div className="mx-auto max-w-sm space-y-4 px-5 pt-5 pb-10">

        {/* 푸시 알림 */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-gray-700">푸시 알림</h2>
          <p className="mb-4 text-xs text-gray-400">오늘 미완료 학습이 있을 때 알림을 받아요</p>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">학습 리마인더</p>
              <p className={`mt-0.5 text-xs ${permission === 'granted' ? 'text-purple-500' : permission === 'denied' ? 'text-red-400' : 'text-gray-400'}`}>
                {permissionLabel}
              </p>
            </div>
            {permission !== 'granted' && permission !== 'denied' && (
              <button
                onClick={requestPermission}
                disabled={loading}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {loading ? '처리 중...' : '허용하기'}
              </button>
            )}
            {permission === 'granted' && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>

        {/* 계정 */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-gray-700">계정</h2>
          <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">로그인 계정</p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-semibold text-red-500"
          >
            로그아웃
          </button>
        </div>

      </div>
    </div>
  )
}

export default SettingsPage
