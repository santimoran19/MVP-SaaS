import { useState, useEffect } from 'react'
import { Clock, Save, Loader2, Power } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { horariosService, DIAS_SEMANA } from '@/services/horarios'
import { cn } from '@/lib/utils'

export function GestionHorarios() {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await horariosService.obtenerTodos()
      setHorarios(
        data.map((h) => ({
          ...h,
          _inicio: h.hora_inicio?.slice(0, 5) ?? '09:00',
          _fin: h.hora_fin?.slice(0, 5) ?? '18:00',
        }))
      )
    } catch (e) {
      toast.error('Error al cargar horarios', { description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (id, field, value) =>
    setHorarios((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)))

  const handleToggle = async (horario) => {
    setGuardando(horario.id)
    try {
      await horariosService.toggleActivo(horario.id, !horario.activo)
      setHorarios((prev) =>
        prev.map((h) => (h.id === horario.id ? { ...h, activo: !horario.activo } : h))
      )
      toast.success(
        horario.activo
          ? `${DIAS_SEMANA[horario.dia_semana]}: cerrado`
          : `${DIAS_SEMANA[horario.dia_semana]}: abierto`
      )
    } catch (e) {
      toast.error('Error al actualizar', { description: e.message })
    } finally {
      setGuardando(null)
    }
  }

  const handleGuardar = async (horario) => {
    if (horario._inicio >= horario._fin) {
      toast.error('La hora de cierre debe ser mayor a la de apertura')
      return
    }
    setGuardando(horario.id)
    try {
      await horariosService.actualizar(horario.id, {
        hora_inicio: horario._inicio,
        hora_fin: horario._fin,
        activo: horario.activo,
      })
      toast.success(`${DIAS_SEMANA[horario.dia_semana]} actualizado`)
    } catch (e) {
      toast.error('No se pudo guardar', { description: e.message })
    } finally {
      setGuardando(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2 max-w-2xl">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--color-primary)]" />
          <h2 className="text-sm font-semibold">Horario de atención semanal</h2>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {horarios.map((horario) => (
            <div
              key={horario.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                !horario.activo && 'bg-[var(--color-secondary)]'
              )}
            >
              {/* Día */}
              <span
                className={cn(
                  'text-sm font-medium w-24 flex-shrink-0',
                  !horario.activo && 'text-[var(--color-muted-foreground)]'
                )}
              >
                {DIAS_SEMANA[horario.dia_semana]}
              </span>

              {/* Horario o label cerrado */}
              {horario.activo ? (
                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                  <Input
                    type="time"
                    value={horario._inicio}
                    onChange={(e) => handleChange(horario.id, '_inicio', e.target.value)}
                    className="h-8 w-28 text-sm flex-shrink-0"
                    step="1800"
                  />
                  <span className="text-[var(--color-muted-foreground)] text-sm">a</span>
                  <Input
                    type="time"
                    value={horario._fin}
                    onChange={(e) => handleChange(horario.id, '_fin', e.target.value)}
                    className="h-8 w-28 text-sm flex-shrink-0"
                    step="1800"
                  />
                  <button
                    onClick={() => handleGuardar(horario)}
                    disabled={guardando === horario.id}
                    title="Guardar"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--color-primary)] hover:bg-blue-50 transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    {guardando === horario.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ) : (
                <span className="flex-1 text-sm text-[var(--color-muted-foreground)]">Cerrado</span>
              )}

              {/* Toggle */}
              <button
                onClick={() => handleToggle(horario)}
                disabled={guardando === horario.id}
                title={horario.activo ? 'Marcar como cerrado' : 'Abrir este día'}
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
                  horario.activo
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)]'
                )}
              >
                <Power className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--color-muted-foreground)] px-1">
        Estos horarios definen cuándo el local está abierto. Los turnos solo se pueden reservar dentro de estos rangos horarios.
      </p>
    </div>
  )
}
