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

  try {
    const userId = await getUserIdFromToken(req)

    // 오늘 태스크 조회
    if (req.method === 'GET') {
      const { date } = req.query
      const targetDate = date || new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('date', targetDate)
        .order('is_review', { ascending: true })
        .order('created_at', { ascending: true })

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
