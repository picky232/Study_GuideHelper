import { handleCors } from '../../src/infrastructure/http/cors.js'
import { supabase } from '../../src/infrastructure/supabase/client.js'
import { getUserIdFromToken } from '../../src/infrastructure/http/auth.js'

// register(POST)/unregister(DELETE)를 한 파일로 통합 — Vercel Hobby 플랜의
// 배포당 서버리스 함수 12개 제한에 맞추기 위함 (기능은 기존과 동일)
export default async function handler(req, res) {
  if (handleCors(req, res)) return

  let userId
  try {
    userId = await getUserIdFromToken(req)
  } catch {
    return res.status(401).json({ error: '인증이 필요합니다' })
  }

  if (req.method === 'POST') {
    try {
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

      // 서비스워커 갱신 등으로 토큰이 바뀌면 예전 토큰(문자열이 다른 행)이
      // 서버에 남아 중복 발송의 원인이 됨 — 이 사용자의 다른 토큰은 모두 정리
      // (클라이언트 로컬 기억에 의존하지 않는 서버 측 단일 토큰 보장)
      await supabase
        .from('fcm_tokens')
        .delete()
        .eq('user_id', userId)
        .neq('token', token)

      return res.status(200).json({ ok: true })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
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

  return res.status(405).json({ error: 'Method Not Allowed' })
}
