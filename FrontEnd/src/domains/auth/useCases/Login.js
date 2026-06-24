export class Login {
  constructor(authRepository) {
    this.authRepository = authRepository
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new Error('이메일, 비밀번호를 입력하세요')
    }
    return this.authRepository.login({ email, password })
  }
}
