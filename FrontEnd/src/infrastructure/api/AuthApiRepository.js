import { IAuthRepository } from '../../domains/auth/repositories/IAuthRepository'
import apiClient from './client'

export class AuthApiRepository extends IAuthRepository {
  async signUp({ email, password, name }) {
    const { data } = await apiClient.post('/auth/signup', { email, password, name })
    return data.user
  }

  async login({ email, password }) {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  }
}
