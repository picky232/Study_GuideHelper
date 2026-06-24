import { IAuthRepository } from '../../domains/user/repositories/IAuthRepository.js'
import { supabase } from '../supabase/client.js'

export class SupabaseAuthRepository extends IAuthRepository {
  async signUp({ email, password, name }) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw new Error(error.message)

    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
    })
    if (profileError) throw new Error(profileError.message)

    return { id: data.user.id, email, name }
  }

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)

    return {
      accessToken: data.session.access_token,
      user: { id: data.user.id, email: data.user.email },
    }
  }
}
