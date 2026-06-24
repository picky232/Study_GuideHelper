export class IAuthRepository {
  async signUp({ email, password, name }) {
    throw new Error('IAuthRepository.signUp 구현 필요')
  }

  async login({ email, password }) {
    throw new Error('IAuthRepository.login 구현 필요')
  }
}
