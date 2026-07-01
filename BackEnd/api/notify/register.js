import { handleCors } from '../../src/infrastructure/http/cors.js'
import { supabase } from '../../src/infrastructure/supabase/client.js'
import { getUserIdFromToken } from '../../src/infrastructure/http/auth.js'

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    let userId
    try {
      userId = await getUserIdFromToken(req)
    } catch {
      return res.status(401).json({ error: '인증이 필요합니다' })
    }
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'token이 없습니다' })

    // 기존 토큰 있으면 skip
    const { data: existing } = await supabase
      .from('fcm_tokens')
      .select('id')
      .eq('token', token)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase
        .from('fcm_tokens')
        .insert({ user_id: userId, token })
      if (error) throw new Error(error.message)
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
