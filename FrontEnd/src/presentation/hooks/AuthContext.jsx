import { createContext, useContext, useState } from 'react'
import { SignUp } from '../../domains/auth/useCases/SignUp'
import { Login } from '../../domains/auth/useCases/Login'
import { AuthApiRepository } from '../../infrastructure/api/AuthApiRepository'
import {
  setToken,
  setRefreshToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from '../../infrastructure/storage/tokenStorage'

const authRepository = new AuthApiRepository()
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())

  async function signUp({ email, password, name }) {
    const signUpUseCase = new SignUp(authRepository)
    return signUpUseCase.execute({ email, password, name })
  }

  async function login({ email, password }) {
    const loginUseCase = new Login(authRepository)
    const result = await loginUseCase.execute({ email, password })
    setToken(result.accessToken)
    if (result.refreshToken) setRefreshToken(result.refreshToken)
    setStoredUser(result.user)
    setUser(result.user)
    return result.user
  }

  function logout() {
    clearToken()
    clearStoredUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용 가능')
  }
  return context
}
