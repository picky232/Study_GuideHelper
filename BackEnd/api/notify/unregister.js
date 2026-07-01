import { handleCors } from '../../src/infrastructure/http/cors.js'
import { supabase } from '../../src/infrastructure/supabase/client.js'

async function getUserIdFromToken(req) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) throw new Error('인증 토큰이 없습니다')
  const { data, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''))
  if (error || !data.user) throw new Error('유효하지 않은 토큰입니다')
  return data.user.id
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    let userId
    try {
      userId = await getUserIdFromToken(req)
    } catch {
      return res.status(401).json({ error: '인증이 필요합니다' })
    }

    const { error } = await supabase
      .from('fcm_tokens')
      .delete()
      .eq('user_id', userId)

    if (error) throw new Error(error.message)

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
