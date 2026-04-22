import { supabase } from '@/lib/supabase'

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const horariosService = {
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('configuracion_horarios')
      .select('*')
      .order('dia_semana')
    if (error) throw new Error(error.message)
    return data
  },

  async actualizar(id, { hora_inicio, hora_fin, activo }) {
    const { data, error } = await supabase
      .from('configuracion_horarios')
      .update({ hora_inicio, hora_fin, activo })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async toggleActivo(id, activo) {
    const { data, error } = await supabase
      .from('configuracion_horarios')
      .update({ activo })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
