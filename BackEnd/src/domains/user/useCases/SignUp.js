import { Email } from '../valueObjects/Email.js'

export class SignUp {
  constructor(authRepository) {
    this.authRepository = authRepository
  }

  async execute({ email, password, name }) {
    new Email(email)
    if (!password || password.length < 8) {
      throw new Error('비밀번호는 8자 이상이어야 합니다')
    }
    return this.authRepository.signUp({ email, password, name })
  }
}
