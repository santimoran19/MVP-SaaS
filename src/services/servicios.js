import { supabase } from '@/lib/supabase'

export const serviciosService = {
  async listar(soloActivos = true) {
    let query = supabase.from('servicios').select('*').order('nombre')
    if (soloActivos) query = query.eq('activo', true)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async crear(servicio) {
    const { data, error } = await supabase
      .from('servicios')
      .insert(servicio)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async actualizar(id, servicio) {
    const { data, error } = await supabase
      .from('servicios')
      .update(servicio)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Soft delete — mantiene el historial de turnos asociados
  async desactivar(id) {
    const { data, error } = await supabase
      .from('servicios')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async activar(id) {
    const { data, error } = await supabase
      .from('servicios')
      .update({ activo: true })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

export const profesionalesService = {
  async listar(soloActivos = true) {
    let query = supabase.from('profesionales').select('*').order('nombre')
    if (soloActivos) query = query.eq('activo', true)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async crear(profesional) {
    const { data, error } = await supabase
      .from('profesionales')
      .insert(profesional)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async actualizar(id, profesional) {
    const { data, error } = await supabase
      .from('profesionales')
      .update(profesional)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async desactivar(id) {
    const { data, error } = await supabase
      .from('profesionales')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async activar(id) {
    const { data, error } = await supabase
      .from('profesionales')
      .update({ activo: true })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
