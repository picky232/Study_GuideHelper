import { IAuthRepository } from '../../domains/user/repositories/IAuthRepository.js'
import { supabase } from '../supabase/client.js'

export class SupabaseAuthRepository extends IAuthRepository {
  async signUp({ email, password, name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('회원가입에 실패했습니다')

    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
    })
    if (profileError) throw new Error(profileError.message)

    return { id: data.user.id, email, name, emailConfirmed: false }
  }

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)
    if (!data.user.email_confirmed_at) {
      throw new Error('이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.')
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    }
  }
}
