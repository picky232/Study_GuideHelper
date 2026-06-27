export const mockTodayTasks = [
  { id: '1', title: '정보처리기사 1과목 - 소프트웨어 설계', duration_min: 60, is_done: true, is_review: false },
  { id: '2', title: '정보처리기사 2과목 - 소프트웨어 개발', duration_min: 60, is_done: false, is_review: false },
  { id: '3', title: '1과목 복습 (망각곡선)', duration_min: 20, is_done: false, is_review: true },
  { id: '4', title: '기출문제 풀이 - 1회분', duration_min: 40, is_done: false, is_review: false },
]

export const mockGoal = {
  subject: '정보처리기사',
  exam_type: '자격증',
  deadline: '2026-08-16',
  daily_hours: 3,
}

export const mockCoachingMessages = {
  high: '오늘도 훌륭해요! 이 페이스라면 시험일 전에 완벽하게 준비될 거예요. 계속 유지하세요!',
  mid: '절반 이상 완료했어요. 남은 태스크도 마저 끝내면 오늘 목표 달성이에요. 조금만 더 힘내요!',
  low: '오늘 학습이 쉽지 않았군요. 미완료 태스크는 내일 일정에 반영할게요. 무리하지 말고 꾸준히!',
}
