import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { turnosService } from '@/services/turnos'

// ─────────────────────────────────────────────
// Utilidades de timezone Buenos Aires
// Usamos Intl API (nativa) en lugar de date-fns-tz
// para no acoplar otra dependencia al bundle.
// ─────────────────────────────────────────────
const TZ = 'America/Argentina/Buenos_Aires'

/** Devuelve la fecha actual en BA como string 'yyyy-MM-dd' */
export function fechaHoyBA() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date())
}

/** Devuelve la hora actual en BA como string 'HH:mm' */
export function horaAhoraBA() {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

/**
 * Valida que una fecha seleccionada no sea pasada según el huso horario BA.
 * Compara sólo la fecha (sin hora) para permitir seleccionar hoy.
 */
export function esFechaFutura(fecha) {
  if (!fecha) return false
  const fechaStr = format(fecha, 'yyyy-MM-dd')
  return fechaStr >= fechaHoyBA()
}

/**
 * Filtra slots que ya pasaron si la fecha seleccionada es hoy en BA.
 * Evita mostrar horarios como "09:00" cuando ya son las 15:00.
 */
export function filtrarSlotsPasados(slots, fecha) {
  if (!fecha) return slots
  const esHoy = format(fecha, 'yyyy-MM-dd') === fechaHoyBA()
  if (!esHoy) return slots
  const ahora = horaAhoraBA()
  return slots.filter((slot) => slot > ahora)
}

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────

export function useTurnosDia(fecha) {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fechaKey = fecha ? format(fecha, 'yyyy-MM-dd') : null

  const cargar = useCallback(async () => {
    if (!fechaKey) return
    try {
      setLoading(true)
      setError(null)
      const data = await turnosService.obtenerTurnosDia(new Date(fechaKey + 'T00:00:00'))
      setTurnos(data)
    } catch (e) {
      setError(e.message)
      toast.error('No se pudieron cargar los turnos', { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [fechaKey])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { turnos, loading, error, recargar: cargar }
}

export function useTurnosSemana(fechaInicio, fechaFin) {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const inicioKey = fechaInicio ? format(fechaInicio, 'yyyy-MM-dd') : null
  const finKey = fechaFin ? format(fechaFin, 'yyyy-MM-dd') : null

  useEffect(() => {
    if (!inicioKey || !finKey) return
    setLoading(true)
    turnosService
      .obtenerTurnosSemana(
        new Date(inicioKey + 'T00:00:00'),
        new Date(finKey + 'T00:00:00')
      )
      .then(setTurnos)
      .catch((e) => {
        setError(e.message)
        toast.error('Error al cargar el calendario')
      })
      .finally(() => setLoading(false))
  }, [inicioKey, finKey])

  return { turnos, loading, error }
}

export function useHorariosDisponibles(profesionalId, servicioId, fecha) {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)

  const fechaKey = fecha ? format(fecha, 'yyyy-MM-dd') : null

  useEffect(() => {
    if (!profesionalId || !servicioId || !fechaKey) {
      setHorarios([])
      return
    }

    // Bloquear fechas pasadas antes de ir a la DB
    if (!esFechaFutura(fecha)) {
      setHorarios([])
      return
    }

    setLoading(true)
    turnosService
      .obtenerHorariosDisponibles(profesionalId, servicioId, new Date(fechaKey + 'T00:00:00'))
      .then((slots) => setHorarios(filtrarSlotsPasados(slots, fecha)))
      .catch(() => setHorarios([]))
      .finally(() => setLoading(false))
  }, [profesionalId, servicioId, fechaKey])

  return { horarios, loading }
}

/**
 * Hook para crear un turno con:
 * - Loading state interno
 * - Toast en cada estado del ciclo de vida
 * - Manejo específico del error de conflicto (race condition / DB constraint 23505)
 */
export function useCrearTurno() {
  const [loading, setLoading] = useState(false)

  const crear = useCallback(async (datos) => {
    setLoading(true)
    const toastId = toast.loading('Confirmando tu turno...')

    try {
      // Validación de fecha futura antes de enviar a la DB
      if (datos.fecha && !esFechaFutura(datos.fecha)) {
        throw new Error('No podés reservar en una fecha pasada')
      }

      const turno = await turnosService.crearTurno(datos)

      toast.success('¡Turno confirmado!', {
        id: toastId,
        description: `Te esperamos el ${format(datos.fecha, 'dd/MM')} a las ${datos.hora} hs`,
      })

      return turno
    } catch (e) {
      const esConflicto =
        e.message?.includes('23505') ||
        e.message?.includes('Conflicto') ||
        e.message?.includes('disponible')

      toast.error(esConflicto ? 'Ese horario ya fue tomado' : 'No se pudo confirmar el turno', {
        id: toastId,
        description: esConflicto
          ? 'Alguien se adelantó. Elegí otro horario.'
          : e.message,
      })
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { crear, loading }
}
