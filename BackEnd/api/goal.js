import { CreateGoal } from '../src/domains/goal/useCases/CreateGoal.js'
import { SupabaseGoalRepository } from '../src/infrastructure/supabase/SupabaseGoalRepository.js'
import { handleCors } from '../src/infrastructure/http/cors.js'
import { supabase } from '../src/infrastructure/supabase/client.js'
import { getUserIdFromToken } from '../src/infrastructure/http/auth.js'

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  try {
    const userId = await getUserIdFromToken(req)

    if (req.method === 'POST') {
      const { subject, examType, examFormat, deadline, dailyHours, completedRange, weakPoints } = req.body
      const createGoal = new CreateGoal(new SupabaseGoalRepository())
      const goal = await createGoal.execute({ userId, subject, examType, examFormat, deadline, dailyHours, completedRange, weakPoints })
      return res.status(201).json({ goal })
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return res.status(200).json({ goals: data })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) throw new Error('목표 ID가 없습니다')
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
  } catch (error) {
    const status = error.message.includes('토큰') ? 401 : 400
    return res.status(status).json({ error: error.message })
  }
}
