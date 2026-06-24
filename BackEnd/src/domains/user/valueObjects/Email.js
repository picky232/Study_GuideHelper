const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Email {
  constructor(value) {
    if (!EMAIL_PATTERN.test(value)) {
      throw new Error(`유효하지 않은 이메일 형식: ${value}`)
    }
    this.value = value
  }

  toString() {
    return this.value
  }
}
