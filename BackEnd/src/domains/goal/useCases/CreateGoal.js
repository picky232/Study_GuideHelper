export class CreateGoal {
  constructor(goalRepository) {
    this.goalRepository = goalRepository
  }

  async execute({ userId, subject, examType, deadline, dailyHours, studyRange, currentLevel }) {
    if (!subject || !subject.trim()) throw new Error('과목명을 입력해주세요')
    if (!deadline) throw new Error('마감일을 입력해주세요')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(deadline) <= today) throw new Error('마감일은 오늘 이후 날짜여야 합니다')
    if (!dailyHours || dailyHours <= 0) throw new Error('하루 공부시간을 입력해주세요')

    return this.goalRepository.create({ userId, subject, examType, deadline, dailyHours, studyRange, currentLevel })
  }
}
