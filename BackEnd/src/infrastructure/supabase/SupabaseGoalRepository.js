import { supabase } from './client.js'
import { Goal } from '../../domains/goal/entities/Goal.js'

export class SupabaseGoalRepository {
  async create({ userId, subject, examType, deadline, dailyHours, studyRange, currentLevel }) {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        subject,
        exam_type: examType,
        deadline,
        daily_hours: dailyHours,
        study_range: studyRange,
        current_level: currentLevel,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return new Goal({
      id: data.id,
      userId: data.user_id,
      subject: data.subject,
      examType: data.exam_type,
      deadline: data.deadline,
      dailyHours: data.daily_hours,
      studyRange: data.study_range,
      currentLevel: data.current_level,
      status: data.status,
    })
  }

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map((d) => new Goal({
      id: d.id,
      userId: d.user_id,
      subject: d.subject,
      examType: d.exam_type,
      deadline: d.deadline,
      dailyHours: d.daily_hours,
      studyRange: d.study_range,
      currentLevel: d.current_level,
      status: d.status,
    }))
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return new Goal({
      id: data.id,
      userId: data.user_id,
      subject: data.subject,
      examType: data.exam_type,
      deadline: data.deadline,
      dailyHours: data.daily_hours,
      studyRange: data.study_range,
      currentLevel: data.current_level,
      status: data.status,
    })
  }
}
