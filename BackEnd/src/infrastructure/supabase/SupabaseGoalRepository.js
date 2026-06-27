import { supabase } from './client.js'
import { Goal } from '../../domains/goal/entities/Goal.js'

export class SupabaseGoalRepository {
  async create({ userId, subject, examType, examFormat, deadline, dailyHours, completedRange, weakPoints }) {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        subject,
        exam_type: examType,
        exam_format: examFormat || '필기',
        deadline,
        daily_hours: dailyHours,
        completed_range: completedRange,
        weak_points: weakPoints,
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
      examFormat: data.exam_format,
      deadline: data.deadline,
      dailyHours: data.daily_hours,
      completedRange: data.completed_range,
      weakPoints: data.weak_points,
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
      examFormat: d.exam_format,
      deadline: d.deadline,
      dailyHours: d.daily_hours,
      completedRange: d.completed_range,
      weakPoints: d.weak_points,
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
      examFormat: data.exam_format,
      deadline: data.deadline,
      dailyHours: data.daily_hours,
      completedRange: data.completed_range,
      weakPoints: data.weak_points,
      status: data.status,
    })
  }
}
