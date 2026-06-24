export class SignUp {
  constructor(authRepository) {
    this.authRepository = authRepository
  }

  async execute({ email, password, name }) {
    if (!email || !password || !name) {
      throw new Error('이메일, 비밀번호, 이름을 모두 입력하세요')
    }
    return this.authRepository.signUp({ email, password, name })
  }
}
