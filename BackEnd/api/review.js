import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'

const REVIEW_DAYS = [1, 3, 7, 14]

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
    const { goalId, completedDate, title, durationMin } = req.body

    if (!goalId || !completedDate || !title || !durationMin) {
      throw new Error('필수 파라미터가 없습니다')
    }

    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('deadline')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single()

    if (goalError || !goal) throw new Error('목표를 찾을 수 없습니다')

    const deadline = new Date(goal.deadline)
    const base = new Date(completedDate)
    const reviewTitle = `[복습] ${title}`
    const reviewDuration = Math.max(10, Math.ceil(durationMin * 0.5))

    const toInsert = []
    for (let i = 0; i < REVIEW_DAYS.length; i++) {
      const reviewDate = new Date(base)
      reviewDate.setDate(reviewDate.getDate() + REVIEW_DAYS[i])
      if (reviewDate > deadline) continue

      const dateStr = reviewDate.toISOString().split('T')[0]

      const { data: existing } = await supabase
        .from('schedules')
        .select('id')
        .eq('user_id', userId)
        .eq('goal_id', goalId)
        .eq('date', dateStr)
        .eq('title', reviewTitle)
        .eq('is_review', true)
        .maybeSingle()

      if (existing) continue

      toInsert.push({
        user_id: userId,
        goal_id: goalId,
        date: dateStr,
        title: reviewTitle,
        duration_min: reviewDuration,
        is_done: false,
        is_review: true,
        review_round: i + 1,
      })
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from('schedules').insert(toInsert)
      if (error) throw new Error(error.message)
    }

    return res.status(200).json({ inserted: toInsert.length })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
