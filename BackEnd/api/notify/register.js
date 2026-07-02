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

    // 같은 토큰 행 조회 (중복 행 존재 가능성 대비 목록으로 조회)
    const { data: existing } = await supabase
      .from('fcm_tokens')
      .select('id, user_id')
      .eq('token', token)
      .order('created_at', { ascending: false })

    if (!existing || existing.length === 0) {
      const { error } = await supabase
        .from('fcm_tokens')
        .insert({ user_id: userId, token })
      if (error) throw new Error(error.message)
    } else {
      // 토큰은 기기(브라우저) 단위 — 마지막 로그인 사용자에게 귀속
      if (existing[0].user_id !== userId) {
        await supabase
          .from('fcm_tokens')
          .update({ user_id: userId })
          .eq('id', existing[0].id)
      }
      // 레이스 등으로 생긴 중복 행 정리
      if (existing.length > 1) {
        const extraIds = existing.slice(1).map((r) => r.id)
        await supabase.from('fcm_tokens').delete().in('id', extraIds)
      }
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
