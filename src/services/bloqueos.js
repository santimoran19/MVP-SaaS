import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export const bloqueosService = {
  async listarPorProfesionalYFecha(profesionalId, fecha) {
    const { data, error } = await supabase
      .from('bloqueos_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', format(fecha, 'yyyy-MM-dd'))
      .order('hora_inicio')
    if (error) throw error
    return data
  },

  async listarPorFecha(fecha) {
    const { data, error } = await supabase
      .from('bloqueos_horarios')
      .select('*, profesionales(nombre)')
      .eq('fecha', format(fecha, 'yyyy-MM-dd'))
      .order('hora_inicio')
    if (error) throw error
    return data
  },

  async crear(bloqueo) {
    const { data, error } = await supabase
      .from('bloqueos_horarios')
      .insert(bloqueo)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async eliminar(id) {
    const { error } = await supabase.from('bloqueos_horarios').delete().eq('id', id)
    if (error) throw error
  },
}
