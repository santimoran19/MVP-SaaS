import { useState, useEffect } from 'react'
import { serviciosService, profesionalesService } from '@/services/servicios'

export function useServicios(soloActivos = true) {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await serviciosService.listar(soloActivos)
      setServicios(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [soloActivos])

  return { servicios, loading, error, recargar: cargar }
}

export function useProfesionales(soloActivos = true) {
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await profesionalesService.listar(soloActivos)
      setProfesionales(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [soloActivos])

  return { profesionales, loading, error, recargar: cargar }
}
