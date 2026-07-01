import { supabase } from '../supabase/client.js'

export async function getUserIdFromToken(req) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) throw new Error('인증 토큰이 없습니다')
  const token = auth.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new Error('유효하지 않은 토큰입니다')
  return data.user.id
}
