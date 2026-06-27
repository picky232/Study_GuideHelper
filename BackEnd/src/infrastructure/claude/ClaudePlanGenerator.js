import { anthropic } from './client.js'

export class ClaudePlanGenerator {
  async generate({ subject, examType, deadline, dailyHours, studyRange, currentLevel }) {
    const today = new Date().toISOString().split('T')[0]
    const dday = Math.ceil((new Date(deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
    const totalHours = dailyHours * dday

    const prompt = `당신은 학습 설계 전문가입니다. 아래 정보를 바탕으로 일자별 학습 계획을 JSON으로 작성해주세요.

## 입력 정보
- 과목: ${subject} (${examType})
- 시작일: ${today}
- 마감일: ${deadline} (D-${dday}, 총 ${dday}일)
- 하루 공부시간: ${dailyHours}시간 (총 ${totalHours}시간)
- 학습 범위: ${studyRange || '전체 범위'}
- 현재 수준: ${currentLevel}%

## 규칙
1. 각 날짜별로 태스크를 배분하세요 (하루 총 duration_min = ${dailyHours * 60}분)
2. 망각곡선 복습: 학습 후 1일·3일·7일·14일째 복습 태스크 삽입 (is_review: true)
3. 마지막 3일은 전체 복습과 모의고사로 구성
4. 현재 수준이 높을수록 심화 내용 비중을 높이세요

## 출력 형식 (JSON 배열만, 설명 없이)
[
  {
    "date": "YYYY-MM-DD",
    "title": "태스크 제목",
    "duration_min": 60,
    "is_review": false
  }
]

총 태스크 수는 ${dday * 2}개 내외로 작성하세요.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].text
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('AI 응답에서 계획을 파싱할 수 없습니다')

    const tasks = JSON.parse(jsonMatch[0])
    return tasks.map((t) => ({
      date: t.date,
      title: t.title,
      duration_min: t.duration_min,
      is_review: t.is_review ?? false,
      is_done: false,
      review_round: t.is_review ? 1 : 0,
    }))
  }
}
