import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'
import { anthropic } from '../src/infrastructure/claude/client.js'
import { getUserIdFromToken } from '../src/infrastructure/http/auth.js'

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    let userId
    try {
      userId = await getUserIdFromToken(req)
    } catch {
      return res.status(401).json({ error: '인증이 필요합니다' })
    }

    // 최근 7일 날짜 범위
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 6)
    const startDate = weekAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]

    // 주간 스케줄 조회
    const { data: schedules, error: schedErr } = await supabase
      .from('schedules')
      .select('date, is_done, duration_min, title, is_review')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (schedErr) throw new Error(schedErr.message)

    const total = schedules.length
    const done = schedules.filter((s) => s.is_done).length
    const totalMin = schedules.reduce((acc, s) => acc + (s.duration_min || 0), 0)
    const doneMin = schedules.filter((s) => s.is_done).reduce((acc, s) => acc + (s.duration_min || 0), 0)
    const achievementRate = total > 0 ? Math.round((done / total) * 100) : 0

    // 날짜별 집계
    const byDate = {}
    for (const s of schedules) {
      if (!byDate[s.date]) byDate[s.date] = { total: 0, done: 0 }
      byDate[s.date].total++
      if (s.is_done) byDate[s.date].done++
    }
    const dailyStats = Object.entries(byDate).map(([date, stat]) => ({
      date,
      rate: Math.round((stat.done / stat.total) * 100),
      done: stat.done,
      total: stat.total,
    }))

    const statsPayload = {
      achievementRate,
      done,
      total,
      doneMin,
      totalMin,
      dailyStats,
      period: { start: startDate, end: endDate },
    }

    // coaching=true 쿼리 파라미터 있을 때만 AI 호출
    if (req.query.coaching !== 'true') {
      return res.status(200).json(statsPayload)
    }

    // 목표 정보
    const { data: goals } = await supabase
      .from('goals')
      .select('subject, deadline')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    const goal = goals?.[0]

    const mood = achievementRate >= 80 ? '높은 성취감' : achievementRate >= 50 ? '꾸준한 노력' : '다시 시작하는 용기'
    const prompt = `학습 중인 학생에게 어울리는 동기부여 명언 하나를 한국어로 생성해주세요.

상황: ${goal?.subject || '공부'} 학습 중, 이번 주 달성률 ${achievementRate}% (${mood}이 필요한 상황)

요구사항:
- 실존 인물의 명언이거나 AI가 창작한 명언 모두 가능
- 형식: "명언 내용" — 출처(인물명 또는 '학습 격언')
- 1~2문장 이내
- 학습·성장·끈기·도전 주제
- 다른 설명 없이 명언만 출력`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    })

    return res.status(200).json({
      ...statsPayload,
      coaching: message.content[0]?.text?.trim() || '',
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
