import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'
import { getUserIdFromToken } from '../src/infrastructure/http/auth.js'

// 망각곡선 기반 복습 주기: 원본 학습 완료 → 1일 뒤, 그 복습 완료 → 3일 뒤, 그 다음 → 7일 뒤. 3회차 이후 종료
const REVIEW_OFFSET_DAYS = { 0: 1, 1: 3, 2: 7 }

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

// 완료 처리된 태스크 다음 단계의 복습 태스크를 자동 삽입한다
async function insertNextReview(task) {
  const currentRound = task.is_review ? task.review_round : 0
  const offsetDays = REVIEW_OFFSET_DAYS[currentRound]
  if (offsetDays === undefined) return null

  const baseTitle = task.title.replace(/^\[복습\]\s*/, '')
  const { error } = await supabase.from('schedules').insert({
    goal_id: task.goal_id,
    user_id: task.user_id,
    date: addDays(task.date, offsetDays),
    title: `[복습] ${baseTitle}`,
    duration_min: 60,
    is_done: false,
    is_review: true,
    review_round: currentRound + 1,
  })
  if (error) throw new Error(error.message)
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  try {
    const userId = await getUserIdFromToken(req)

    if (req.method === 'GET') {
      const { date, from, to } = req.query

      // 월별 범위 조회
      if (from && to) {
        const { data, error } = await supabase
          .from('schedules')
          .select('id, date, title, duration_min, is_done, is_review')
          .eq('user_id', userId)
          .gte('date', from)
          .lte('date', to)
          .order('date', { ascending: true })

        if (error) throw new Error(error.message)
        return res.status(200).json({ schedules: data })
      }

      // 단일 날짜 조회
      const { goalId } = req.query
      const targetDate = date || new Date().toISOString().split('T')[0]
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('date', targetDate)
        .order('is_review', { ascending: true })
        .order('created_at', { ascending: true })

      if (goalId) query = query.eq('goal_id', goalId)

      const { data, error } = await query

      if (error) throw new Error(error.message)
      return res.status(200).json({ schedules: data })
    }

    // 완료 체크 토글
    if (req.method === 'PATCH') {
      const { id, is_done } = req.body
      if (!id) throw new Error('태스크 ID가 없습니다')

      const { data: prev, error: prevError } = await supabase
        .from('schedules')
        .select('is_done')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
      if (prevError) throw new Error(prevError.message)

      const { data, error } = await supabase
        .from('schedules')
        .update({ is_done })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // 미완료 → 완료로 바뀐 순간에만 다음 복습 태스크 삽입 (중복 삽입 방지)
      if (is_done && !prev.is_done) {
        await insertNextReview(data)
      }

      return res.status(200).json({ schedule: data })
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
  } catch (error) {
    const status = error.message.includes('토큰') ? 401 : 400
    return res.status(status).json({ error: error.message })
  }
}
