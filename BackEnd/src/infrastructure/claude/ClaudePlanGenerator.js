import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

export class ClaudePlanGenerator {
  async generate({ subject, examType, examFormat, deadline, dailyHours, completedRange, weakPoints }) {
    const today = new Date().toISOString().split('T')[0]
    const dday = Math.ceil((new Date(deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
    const totalHours = dailyHours * dday

    const completedSection = completedRange
      ? `- 완료한 단원: ${completedRange}\n  → 이 단원들은 신규 학습 없이 복습 태스크로만 배치`
      : '- 완료한 단원: 없음 (처음 시작)'

    const weakSection = weakPoints
      ? `- 약점 단원: ${weakPoints}\n  → 해당 단원 학습 시간 1.5배, 복습 주기 단축`
      : ''

    const prompt = `당신은 ${examType} 전문 학습 설계사입니다. 아래 학습자 현황을 분석하여 실제 시험 출제 단원 기반의 맞춤 학습 계획을 JSON으로 작성해주세요.

## 학습자 정보
- 과목: ${subject} (${examType} / ${examFormat || '필기'})
- 시작일: ${today}
- 마감일: ${deadline} (D-${dday}, 총 ${dday}일)
- 하루 공부시간: ${dailyHours}시간 (총 ${totalHours}시간)
${completedSection}
${weakSection}

## 핵심 지시사항
1. **실제 단원명 사용**: "${subject} ${examType} ${examFormat || '필기'}"의 실제 출제 단원·챕터·토픽을 파악하여 구체적 단원명으로 태스크 제목 작성 ("1단원 학습" 금지)
2. **완료 단원 처리**: 이미 완료한 단원은 신규 학습 태스크 생성 금지. 대신 적절한 시점에 복습 태스크만 배치
3. **미완료 단원**: 완료하지 않은 단원을 기초→응용→심화 순으로 진도 배치
4. **실기 포함 시**: examFormat이 '실기' 또는 '필기+실기'면 실기 실습 태스크 별도 배치
5. **하루 배분**: 하루 총 duration_min 합계 = ${dailyHours * 60}분 준수
6. **망각곡선 복습**: 새 단원 학습 후 1일·3일·7일 뒤 복습 태스크 삽입 (is_review: true, 제목 "[복습]" 접두사)
7. **마지막 ${Math.min(3, dday)}일**: 전체 복습 + 기출/모의고사 실전풀이

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
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    })
    if (message.stop_reason === 'max_tokens') {
      throw new Error('계획이 너무 길어 생성에 실패했습니다. 다시 시도해주세요')
    }
    const text = message.content[0].text

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('AI 응답에서 계획을 파싱할 수 없습니다')

    let tasks
    try {
      tasks = JSON.parse(jsonMatch[0])
    } catch {
      throw new Error('AI 응답 파싱에 실패했습니다. 다시 시도해주세요')
    }
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
