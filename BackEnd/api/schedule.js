import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'
import { getUserIdFromToken } from '../src/infrastructure/http/auth.js'

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

      const { data, error } = await supabase
        .from('schedules')
        .update({ is_done })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return res.status(200).json({ schedule: data })
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
  } catch (error) {
    const status = error.message.includes('토큰') ? 401 : 400
    return res.status(status).json({ error: error.message })
  }
}
