import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export const turnosService = {
  async obtenerTurnosDia(fecha) {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('turnos')
      .select(`*, servicios (nombre, duracion_minutos, precio), profesionales (nombre)`)
      .eq('fecha', fechaStr)
      .order('hora')

    if (error) throw error
    return data
  },

  async obtenerTurnosSemana(fechaInicio, fechaFin) {
    const { data, error } = await supabase
      .from('turnos')
      .select(`*, servicios (nombre, duracion_minutos, precio), profesionales (nombre)`)
      .gte('fecha', format(fechaInicio, 'yyyy-MM-dd'))
      .lte('fecha', format(fechaFin, 'yyyy-MM-dd'))
      .order('fecha')
      .order('hora')

    if (error) throw error
    return data
  },

  async obtenerHorariosDisponibles(profesionalId, servicioId, fecha, excludeTurnoId = null) {
    const fechaStr = format(fecha, 'yyyy-MM-dd')

    let turnosQuery = supabase
      .from('turnos')
      .select('hora, servicios(duracion_minutos)')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fechaStr)
      .not('estado', 'eq', 'cancelado')

    if (excludeTurnoId) {
      turnosQuery = turnosQuery.not('id', 'eq', excludeTurnoId)
    }

    const [{ data: servicio }, { data: horario }, { data: turnosExistentes }, { data: bloqueos }] =
      await Promise.all([
        supabase.from('servicios').select('duracion_minutos').eq('id', servicioId).single(),
        supabase
          .from('configuracion_horarios')
          .select('hora_inicio, hora_fin')
          .eq('dia_semana', fecha.getDay())
          .eq('activo', true)
          .single(),
        turnosQuery,
        supabase
          .from('bloqueos_horarios')
          .select('hora_inicio, hora_fin')
          .eq('profesional_id', profesionalId)
          .eq('fecha', fechaStr),
      ])

    if (!horario || !servicio) return []

    return calcularHorariosLibres(
      horario.hora_inicio,
      horario.hora_fin,
      turnosExistentes || [],
      servicio.duracion_minutos,
      bloqueos || []
    )
  },

  async crearTurno(turnoData) {
    const fechaStr = format(turnoData.fecha, 'yyyy-MM-dd')

    const { data: solapamiento } = await supabase
      .from('turnos')
      .select('id')
      .eq('profesional_id', turnoData.profesional_id)
      .eq('fecha', fechaStr)
      .eq('hora', turnoData.hora)
      .not('estado', 'eq', 'cancelado')

    if (solapamiento && solapamiento.length > 0) {
      throw new Error('Conflicto de horario: el slot ya no está disponible')
    }

    const { data, error } = await supabase
      .from('turnos')
      .insert({ ...turnoData, fecha: fechaStr, estado: 'pendiente' })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Conflicto de horario: ese slot fue tomado al mismo tiempo')
      }
      throw new Error(error.message)
    }

    return data
  },

  async moverTurno(turnoId, { profesional_id, fecha, hora }) {
    const fechaStr = typeof fecha === 'string' ? fecha : format(fecha, 'yyyy-MM-dd')

    const { data: solapamiento } = await supabase
      .from('turnos')
      .select('id')
      .eq('profesional_id', profesional_id)
      .eq('fecha', fechaStr)
      .eq('hora', hora)
      .not('estado', 'eq', 'cancelado')
      .not('id', 'eq', turnoId)

    if (solapamiento && solapamiento.length > 0) {
      throw new Error('Ese horario ya está ocupado por otro turno')
    }

    const { data, error } = await supabase
      .from('turnos')
      .update({ profesional_id, fecha: fechaStr, hora })
      .eq('id', turnoId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') throw new Error('Conflicto de horario al guardar el cambio')
      throw new Error(error.message)
    }
    return data
  },

  async actualizarEstado(turnoId, estado) {
    const { data, error } = await supabase
      .from('turnos')
      .update({ estado })
      .eq('id', turnoId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async cancelarTurno(turnoId) {
    return this.actualizarEstado(turnoId, 'cancelado')
  },

  async eliminarTurno(turnoId) {
    const { error } = await supabase.from('turnos').delete().eq('id', turnoId)
    if (error) throw new Error(error.message)
  },
}

function calcularHorariosLibres(horaInicio, horaFin, turnosExistentes, duracionMinutos, bloqueos = []) {
  const slots = []
  let [h, m] = horaInicio.split(':').map(Number)
  const [hFin, mFin] = horaFin.split(':').map(Number)
  const minutosFinales = hFin * 60 + mFin

  while (h * 60 + m + duracionMinutos <= minutosFinales) {
    const inicioSlot = h * 60 + m
    const finSlot = inicioSlot + duracionMinutos
    const horaSlot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

    const ocupado = turnosExistentes.some((turno) => {
      const [th, tm] = turno.hora.split(':').map(Number)
      const inicioTurno = th * 60 + tm
      const finTurno = inicioTurno + (turno.servicios?.duracion_minutos || 30)
      return inicioSlot < finTurno && finSlot > inicioTurno
    })

    const bloqueado = bloqueos.some((b) => {
      const [bIh, bIm] = b.hora_inicio.split(':').map(Number)
      const [bFh, bFm] = b.hora_fin.split(':').map(Number)
      return inicioSlot < bFh * 60 + bFm && finSlot > bIh * 60 + bIm
    })

    if (!ocupado && !bloqueado) slots.push(horaSlot)

    m += duracionMinutos
    if (m >= 60) {
      h += Math.floor(m / 60)
      m = m % 60
    }
  }

  return slots
}
