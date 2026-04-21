import { useState, useEffect, useCallback } from 'react'
import { turnosService } from '@/services/turnos'

export function useTurnosDia(fecha) {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    if (!fecha) return
    try {
      setLoading(true)
      setError(null)
      const data = await turnosService.obtenerTurnosDia(fecha)
      setTurnos(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [fecha])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { turnos, loading, error, recargar: cargar }
}

export function useTurnosSemana(fechaInicio, fechaFin) {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    turnosService
      .obtenerTurnosSemana(fechaInicio, fechaFin)
      .then(setTurnos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [fechaInicio, fechaFin])

  return { turnos, loading, error }
}

export function useHorariosDisponibles(profesionalId, servicioId, fecha) {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profesionalId || !servicioId || !fecha) {
      setHorarios([])
      return
    }
    setLoading(true)
    turnosService
      .obtenerHorariosDisponibles(profesionalId, servicioId, fecha)
      .then(setHorarios)
      .catch(() => setHorarios([]))
      .finally(() => setLoading(false))
  }, [profesionalId, servicioId, fecha])

  return { horarios, loading }
}
