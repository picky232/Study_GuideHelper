import { handleCors } from '../../src/infrastructure/http/cors.js'

// 클라이언트(브라우저) 에러를 Vercel 함수 로그로 남기기 위한 임시 진단용 엔드포인트.
// 인증 없이 받되, 로그로만 남기고 아무 데이터도 저장하지 않음.
export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { context, message, stack } = req.body || {}
  console.error(`[FCM DEBUG] context=${context} message=${message}\n${stack || ''}`)

  return res.status(200).json({ ok: true })
}
