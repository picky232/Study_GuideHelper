import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './presentation/hooks/AuthContext'

// 새 버전 감지 시 자동 갱신 — 구버전 캐시가 남는 문제 방지.
// iOS PWA는 앱을 완전히 종료하지 않고 백그라운드에 두는 경우가 많아
// 새로 열어도 서비스워커 업데이트 체크가 안 일어날 수 있음 → 주기적으로 직접 체크하고,
// 새 버전이 실제로 페이지를 장악(controllerchange)하면 즉시 새로고침해서 반영한다.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    registration.update()
    setInterval(() => registration.update(), 60 * 1000)
  },
})

let reloading = false
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (reloading) return
  reloading = true
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
