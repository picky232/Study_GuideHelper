import { useFcm } from '../../presentation/hooks/useFcm'
import { useAuth } from '../../presentation/hooks/AuthContext'
import { useFocusSettings } from '../../presentation/hooks/useFocusSettings'

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`flex h-6 w-11 flex-shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:opacity-50 ${on ? 'bg-purple-600' : 'bg-gray-200'}`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

const FOCUS_PRESETS = [0, 5, 10, 15, 20, 30]

function SettingsPage() {
  const { permission, enabled, loading, error, requestPermission, disableNotification } = useFcm()
  const { user, logout } = useAuth()
  const { minFocusMinutes, setMinFocusMinutes } = useFocusSettings()

  async function handleToggle(turnOn) {
    if (turnOn) {
      await requestPermission()
    } else {
      await disableNotification()
    }
  }

  const isGranted = permission === 'granted'
  const isDenied = permission === 'denied'

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
          <p className="mb-4 text-xs text-gray-400">미완료 학습이 있을 때 알림을 받아요</p>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">학습 리마인더</p>
              <p className={`mt-0.5 text-xs ${isGranted && enabled ? 'text-purple-500' : isDenied ? 'text-red-400' : 'text-gray-400'}`}>
                {isDenied
                  ? '브라우저 설정에서 차단됨'
                  : !isGranted
                  ? '허용 안 됨'
                  : enabled ? '알림 켜짐' : '알림 꺼짐'}
              </p>
            </div>
            {isDenied ? (
              <span className="text-xs text-red-400">브라우저에서 해제</span>
            ) : !isGranted ? (
              <button
                onClick={() => handleToggle(true)}
                disabled={loading}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
              >
                {loading ? '...' : '허용하기'}
              </button>
            ) : (
              <Toggle on={enabled} onChange={handleToggle} disabled={loading} />
            )}
          </div>

          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        {/* 집중 잠금 */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-gray-700">집중 잠금</h2>
          <p className="mb-4 text-xs text-gray-400">
            타이머 시작 후 최소 집중 시간 동안 완료·닫기가 잠겨요. 앱을 벗어나면 타이머가 멈춰요.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {FOCUS_PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setMinFocusMinutes(m)}
                className={`rounded-xl py-2.5 text-sm font-medium transition ${
                  minFocusMinutes === m
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m === 0 ? '끄기' : `${m}분`}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
            <span className="flex-shrink-0 text-xs text-gray-500">직접 입력</span>
            <input
              type="number"
              min="0"
              max="180"
              value={minFocusMinutes || ''}
              placeholder="0"
              onChange={(e) => setMinFocusMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-transparent text-center text-base font-semibold text-gray-800 outline-none"
            />
            <span className="flex-shrink-0 text-xs text-gray-500">분</span>
          </div>

          {minFocusMinutes > 0 && (
            <p className="mt-2 text-xs text-purple-500">
              타이머 시작 후 {minFocusMinutes}분 동안 잠금이 유지돼요
            </p>
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
            className="w-full rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-100 active:scale-[0.98]"
          >
            로그아웃
          </button>
        </div>

      </div>
    </div>
  )
}

export default SettingsPage
