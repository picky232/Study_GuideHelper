import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'
import { anthropic } from '../src/infrastructure/claude/client.js'

async function getUserIdFromToken(req) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) throw new Error('인증 토큰이 없습니다')
  const { data, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''))
  if (error || !data.user) throw new Error('유효하지 않은 토큰입니다')
  return data.user.id
}

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

    const prompt = `당신은 학습 코치입니다. 학생의 이번 주 학습 데이터를 보고 짧고 따뜻한 피드백을 한국어로 작성해주세요.

학습 데이터:
- 목표 과목: ${goal?.subject || '미설정'}
- 이번 주 달성률: ${achievementRate}%
- 완료 태스크: ${done}/${total}개
- 총 학습 시간: ${Math.round((doneMin / 60) * 10) / 10}시간 / 계획 ${Math.round((totalMin / 60) * 10) / 10}시간
- 날짜별 달성률: ${dailyStats.map((d) => `${d.date.slice(5)}(${d.rate}%)`).join(', ')}

요구사항:
- 2~3문장으로 간결하게
- 잘한 점 인정 + 개선 방향 제시
- 숫자 언급 1개 이하
- 응원 마무리`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    return res.status(200).json({
      ...statsPayload,
      coaching: message.content[0]?.text || '',
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
