import { ClaudePlanGenerator } from '../src/infrastructure/claude/ClaudePlanGenerator.js'
import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'
import { getUserIdFromToken } from '../src/infrastructure/http/auth.js'

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const userId = await getUserIdFromToken(req)
    const { goalId, subject, examType, examFormat, deadline, dailyHours, completedRange, weakPoints } = req.body

    const generator = new ClaudePlanGenerator()
    const tasks = await generator.generate({ subject, examType, examFormat, deadline, dailyHours, completedRange, weakPoints })

    // 재생성 시 기존 계획 제거 — 없으면 "다시 생성하기"마다 태스크가 중복 누적됨
    const { error: delError } = await supabase
      .from('schedules')
      .delete()
      .eq('user_id', userId)
      .eq('goal_id', goalId)
    if (delError) throw new Error(delError.message)

    const schedules = tasks.map((t) => ({
      goal_id: goalId,
      user_id: userId,
      date: t.date,
      title: t.title,
      duration_min: t.duration_min,
      is_done: false,
      is_review: t.is_review,
      review_round: t.review_round,
    }))

    const { data, error } = await supabase.from('schedules').insert(schedules).select()
    if (error) throw new Error(error.message)

    return res.status(200).json({ tasks: data })
  } catch (error) {
    const status = error.message.includes('토큰') ? 401 : 500
    return res.status(status).json({ error: error.message })
  }
}
