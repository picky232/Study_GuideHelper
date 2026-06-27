import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

export class ClaudePlanGenerator {
  async generate({ subject, examType, deadline, dailyHours, studyRange, currentLevel }) {
    const today = new Date().toISOString().split('T')[0]
    const dday = Math.ceil((new Date(deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
    const totalHours = dailyHours * dday

    const prompt = `당신은 ${examType} 전문 학습 설계사입니다. 아래 정보를 바탕으로 실제 시험 출제 단원·주제 기반의 일자별 학습 계획을 JSON으로 작성해주세요.

## 학습자 정보
- 과목: ${subject} (${examType})
- 시작일: ${today}
- 마감일: ${deadline} (D-${dday}, 총 ${dday}일)
- 하루 공부시간: ${dailyHours}시간 (총 ${totalHours}시간)
- 학습 범위: ${studyRange || '시험 전체 출제 범위'}
- 현재 수준: ${currentLevel}% (0=완전 초급, 100=완전 숙달)

## 핵심 지시사항
1. **실제 단원명 사용**: "${subject} ${examType}"의 실제 출제 단원·챕터·토픽을 당신의 지식으로 파악하여, "1단원 학습"처럼 모호한 제목 대신 "극한의 정의와 수렴·발산", "다항함수의 미분법" 처럼 구체적 단원명으로 태스크 제목 작성
2. **난이도 순서**: 기초 개념 → 핵심 공식·이론 → 응용·문제풀이 → 심화 순으로 진도 배치. 현재 수준 ${currentLevel}%가 높을수록 기초 비중 줄이고 심화·실전 비중 높임
3. **하루 배분**: 하루 총 duration_min 합계 = ${dailyHours * 60}분 준수
4. **망각곡선 복습**: 새 단원 학습 후 1일·3일·7일 뒤 복습 태스크 삽입 (is_review: true, 제목에 "[복습]" 접두사)
5. **마지막 ${Math.min(3, dday)}일**: 전체 단원 복습 + 기출/모의고사 실전풀이로 구성
6. **학습 범위 우선**: 사용자가 특정 범위를 입력했다면 그 범위를 우선 커버

## 출력 형식 (순수 JSON 배열만, 마크다운·코드블록·설명 없이)
[
  {
    "date": "YYYY-MM-DD",
    "title": "구체적 단원명 포함 태스크 제목",
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
