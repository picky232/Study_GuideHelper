import { Email } from '../valueObjects/Email.js'

export class Login {
  constructor(authRepository) {
    this.authRepository = authRepository
  }

  async execute({ email, password }) {
    new Email(email)
    if (!password) {
      throw new Error('비밀번호를 입력하세요')
    }
    return this.authRepository.login({ email, password })
  }
}
