import { handleCors } from '../../src/infrastructure/http/cors.js'
import { supabase } from '../../src/infrastructure/supabase/client.js'

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw new Error('refresh_token이 없습니다')

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) throw new Error('토큰 갱신 실패')

    return res.status(200).json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    })
  } catch (error) {
    return res.status(401).json({ error: error.message })
  }
}
