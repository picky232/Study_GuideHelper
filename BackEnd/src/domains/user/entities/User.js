export class User {
  constructor({ id, email, name, dailyStudyHours = null, notifyTime = null }) {
    this.id = id
    this.email = email
    this.name = name
    this.dailyStudyHours = dailyStudyHours
    this.notifyTime = notifyTime
  }
}
