import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './presentation/hooks/AuthContext'

// 새 버전 감지 시 자동 갱신 — 구버전 캐시가 남는 문제 방지
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
