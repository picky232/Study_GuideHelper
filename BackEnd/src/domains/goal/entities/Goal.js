export class Goal {
  constructor({ id, userId, subject, examType, examFormat, deadline, dailyHours, completedRange, weakPoints, status = 'active' }) {
    this.id = id
    this.userId = userId
    this.subject = subject
    this.examType = examType
    this.examFormat = examFormat || '필기'
    this.deadline = deadline
    this.dailyHours = dailyHours
    this.completedRange = completedRange
    this.weakPoints = weakPoints
    this.status = status
  }
}
