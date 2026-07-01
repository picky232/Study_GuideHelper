import { SignUp } from '../../src/domains/user/useCases/SignUp.js'
import { SupabaseAuthRepository } from '../../src/infrastructure/auth/SupabaseAuthRepository.js'
import { handleCors } from '../../src/infrastructure/http/cors.js'

export default async function handler(req, res) {
  if (handleCors(req, res)) return
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { email, password, name } = req.body
    const signUp = new SignUp(new SupabaseAuthRepository())
    const user = await signUp.execute({ email, password, name })
    return res.status(201).json({ user, message: '이메일을 확인하여 인증을 완료해주세요' })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
