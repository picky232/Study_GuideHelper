import { handleCors } from '../../src/infrastructure/http/cors.js'
import { supabase } from '../../src/infrastructure/supabase/client.js'
import { getMessagingClient } from '../../src/infrastructure/fcm/client.js'

// Vercel Cron 또는 수동 호출: POST /api/notify/send
// body: { userId? } — 없으면 전체 사용자 발송
export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const today = new Date().toISOString().split('T')[0]

    // 오늘 미완료 태스크 있는 사용자 토큰 조회
    const { data: tokens, error } = await supabase
      .from('fcm_tokens')
      .select('token, user_id')

    if (error) throw new Error(error.message)
    if (!tokens || tokens.length === 0) return res.status(200).json({ sent: 0 })

    const messaging = getMessagingClient()
    let sent = 0
    const failed = []

    for (const { token, user_id } of tokens) {
      // 해당 사용자 오늘 미완료 태스크 수 확인
      const { count } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .eq('date', today)
        .eq('is_done', false)

      if (!count || count === 0) continue

      try {
        await messaging.send({
          token,
          notification: {
            title: '학습 설계 도우미',
            body: `오늘 미완료 학습이 ${count}개 남았어요! 지금 시작해볼까요?`,
          },
          webpush: {
            fcmOptions: { link: '/' },
          },
        })
        sent++
      } catch {
        failed.push(token)
      }
    }

    // 유효하지 않은 토큰 정리
    if (failed.length > 0) {
      await supabase.from('fcm_tokens').delete().in('token', failed)
    }

    return res.status(200).json({ sent, failed: failed.length })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
