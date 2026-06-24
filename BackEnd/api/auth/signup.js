import { SignUp } from '../../src/domains/user/useCases/SignUp.js'
import { SupabaseAuthRepository } from '../../src/infrastructure/auth/SupabaseAuthRepository.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { email, password, name } = req.body
    const signUp = new SignUp(new SupabaseAuthRepository())
    const user = await signUp.execute({ email, password, name })
    return res.status(201).json({ user })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
