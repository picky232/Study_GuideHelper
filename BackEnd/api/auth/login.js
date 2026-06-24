import { Login } from '../../src/domains/user/useCases/Login.js'
import { SupabaseAuthRepository } from '../../src/infrastructure/auth/SupabaseAuthRepository.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { email, password } = req.body
    const login = new Login(new SupabaseAuthRepository())
    const result = await login.execute({ email, password })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(401).json({ error: error.message })
  }
}
