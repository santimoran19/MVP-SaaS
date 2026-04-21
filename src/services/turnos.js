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

  async obtenerHorariosDisponibles(profesionalId, servicioId, fecha) {
    const fechaStr = format(fecha, 'yyyy-MM-dd')

    const [{ data: servicio }, { data: horario }, { data: turnosExistentes }] =
      await Promise.all([
        supabase.from('servicios').select('duracion_minutos').eq('id', servicioId).single(),
        supabase
          .from('horarios_profesionales')
          .select('hora_inicio, hora_fin')
          .eq('profesional_id', profesionalId)
          .eq('dia_semana', fecha.getDay())
          .single(),
        supabase
          .from('turnos')
          .select('hora, servicios(duracion_minutos)')
          .eq('profesional_id', profesionalId)
          .eq('fecha', fechaStr)
          .not('estado', 'eq', 'cancelado'),
      ])

    if (!horario || !servicio) return []

    return calcularHorariosLibres(
      horario.hora_inicio,
      horario.hora_fin,
      turnosExistentes || [],
      servicio.duracion_minutos
    )
  },

  async crearTurno(turnoData) {
    const fechaStr = format(turnoData.fecha, 'yyyy-MM-dd')

    // Verificación pre-INSERT (soft check, la DB tiene el hard constraint)
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
      // Código 23505 = unique_violation (race condition llegó hasta la DB)
      if (error.code === '23505') {
        throw new Error('Conflicto de horario: ese slot fue tomado al mismo tiempo')
      }
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
}

function calcularHorariosLibres(horaInicio, horaFin, turnosExistentes, duracionMinutos) {
  const slots = []
  let [h, m] = horaInicio.split(':').map(Number)
  const [hFin, mFin] = horaFin.split(':').map(Number)
  const minutosFinales = hFin * 60 + mFin

  while (h * 60 + m + duracionMinutos <= minutosFinales) {
    const horaSlot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

    const ocupado = turnosExistentes.some((turno) => {
      const [th, tm] = turno.hora.split(':').map(Number)
      const inicioTurno = th * 60 + tm
      const finTurno = inicioTurno + (turno.servicios?.duracion_minutos || 30)
      const inicioSlot = h * 60 + m
      const finSlot = inicioSlot + duracionMinutos
      return inicioSlot < finTurno && finSlot > inicioTurno
    })

    if (!ocupado) slots.push(horaSlot)

    m += duracionMinutos
    if (m >= 60) {
      h += Math.floor(m / 60)
      m = m % 60
    }
  }

  return slots
}
