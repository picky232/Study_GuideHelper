import { handleCors } from '../../src/infrastructure/http/cors.js'
import { supabase } from '../../src/infrastructure/supabase/client.js'

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: '이메일을 입력해주세요' })

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
  })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ message: '비밀번호 재설정 이메일을 발송했습니다' })
}
