import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'
import { getUserIdFromToken } from '../src/infrastructure/http/auth.js'

const REVIEW_DAYS = [1, 3, 7, 14]

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

    const candidates = []
    for (let i = 0; i < REVIEW_DAYS.length; i++) {
      const reviewDate = new Date(base)
      reviewDate.setDate(reviewDate.getDate() + REVIEW_DAYS[i])
      if (reviewDate > deadline) continue
      candidates.push({ dateStr: reviewDate.toISOString().split('T')[0], round: i + 1 })
    }

    const candidateDates = candidates.map((c) => c.dateStr)
    const { data: existingRows } = await supabase
      .from('schedules')
      .select('date')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('title', reviewTitle)
      .eq('is_review', true)
      .in('date', candidateDates.length > 0 ? candidateDates : [''])

    const existingDates = new Set((existingRows || []).map((r) => r.date))

    const toInsert = candidates
      .filter((c) => !existingDates.has(c.dateStr))
      .map((c) => ({
        user_id: userId,
        goal_id: goalId,
        date: c.dateStr,
        title: reviewTitle,
        duration_min: reviewDuration,
        is_done: false,
        is_review: true,
        review_round: c.round,
      }))

    if (toInsert.length > 0) {
      const { error } = await supabase.from('schedules').insert(toInsert)
      if (error) throw new Error(error.message)
    }

    return res.status(200).json({ inserted: toInsert.length })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
