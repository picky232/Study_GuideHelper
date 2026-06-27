import { ClaudePlanGenerator } from '../src/infrastructure/claude/ClaudePlanGenerator.js'
import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'

async function getUserIdFromToken(req) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) throw new Error('인증 토큰이 없습니다')
  const token = auth.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new Error('유효하지 않은 토큰입니다')
  return data.user.id
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const userId = await getUserIdFromToken(req)
    const { goalId, subject, examType, deadline, dailyHours, studyRange, currentLevel } = req.body

    const generator = new ClaudePlanGenerator()
    const tasks = await generator.generate({ subject, examType, deadline, dailyHours, studyRange, currentLevel })

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
