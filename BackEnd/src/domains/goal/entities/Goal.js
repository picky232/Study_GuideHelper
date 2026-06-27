export class Goal {
  constructor({ id, userId, subject, examType, deadline, dailyHours, studyRange, currentLevel, status = 'active' }) {
    this.id = id
    this.userId = userId
    this.subject = subject
    this.examType = examType
    this.deadline = deadline
    this.dailyHours = dailyHours
    this.studyRange = studyRange
    this.currentLevel = currentLevel
    this.status = status
  }
}
