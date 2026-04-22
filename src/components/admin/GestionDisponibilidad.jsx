import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Trash2, BanIcon, Loader2, CalendarOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bloqueoSchema } from '@/lib/validations'
import { bloqueosService } from '@/services/bloqueos'
import { useProfesionales } from '@/hooks/useServicios'

export function GestionDisponibilidad() {
  const { profesionales } = useProfesionales(false)
  const [bloqueos, setBloqueos] = useState([])
  const [loadingBloqueos, setLoadingBloqueos] = useState(false)
  const [fechaFiltro, setFechaFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bloqueoSchema),
    defaultValues: {
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora_inicio: '09:00',
      hora_fin: '13:00',
      motivo: '',
    },
  })

  const cargarBloqueos = async (fecha) => {
    setLoadingBloqueos(true)
    try {
      const data = await bloqueosService.listarPorFecha(new Date(fecha + 'T00:00:00'))
      setBloqueos(data)
    } catch (e) {
      toast.error('Error al cargar bloqueos', { description: e.message })
    } finally {
      setLoadingBloqueos(false)
    }
  }

  useEffect(() => {
    cargarBloqueos(fechaFiltro)
  }, [fechaFiltro])

  const crearBloqueo = async (datos) => {
    try {
      await bloqueosService.crear(datos)
      toast.success('Horario bloqueado correctamente')
      reset({
        profesional_id: datos.profesional_id,
        fecha: datos.fecha,
        hora_inicio: '09:00',
        hora_fin: '13:00',
        motivo: '',
      })
      cargarBloqueos(fechaFiltro)
    } catch (e) {
      toast.error('No se pudo crear el bloqueo', { description: e.message })
    }
  }

  const eliminarBloqueo = async (id, motivo) => {
    try {
      await bloqueosService.eliminar(id)
      toast.success('Bloqueo eliminado')
      cargarBloqueos(fechaFiltro)
    } catch (e) {
      toast.error('Error al eliminar', { description: e.message })
    }
  }

  const bloqueosPorProfesional = bloqueos.reduce((acc, b) => {
    const nombre = b.profesionales?.nombre || 'Sin asignar'
    if (!acc[nombre]) acc[nombre] = []
    acc[nombre].push(b)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Nuevo bloqueo */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <BanIcon className="h-4 w-4 text-amber-500" />
          Bloquear horario
        </h2>

        <form onSubmit={handleSubmit(crearBloqueo)} className="space-y-4">
          {/* Profesional */}
          <div className="space-y-1.5">
            <Label>Profesional</Label>
            <select
              className="w-full h-10 rounded-lg border border-[var(--color-input)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              {...register('profesional_id')}
            >
              <option value="">— Seleccioná un profesional —</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {errors.profesional_id && <p className="text-xs text-red-500">{errors.profesional_id.message}</p>}
          </div>

          {/* Fecha + rango horario */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Input type="date" {...register('fecha')} />
              {errors.fecha && <p className="text-xs text-red-500">{errors.fecha.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Desde</Label>
              <Input type="time" step="1800" {...register('hora_inicio')} />
              {errors.hora_inicio && <p className="text-xs text-red-500">{errors.hora_inicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Hasta</Label>
              <Input type="time" step="1800" {...register('hora_fin')} />
              {errors.hora_fin && <p className="text-xs text-red-500">{errors.hora_fin.message}</p>}
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <Label>Motivo <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span></Label>
            <Input placeholder="Ej: Capacitación, feriado, turno libre..." {...register('motivo')} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Bloqueando...</>
            ) : (
              <><Plus className="h-4 w-4" />Agregar bloqueo</>
            )}
          </Button>
        </form>
      </div>

      {/* Lista de bloqueos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Bloqueos del día</h2>
          <Input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="w-auto"
          />
        </div>

        {loadingBloqueos ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : Object.keys(bloqueosPorProfesional).length === 0 ? (
          <div className="text-center py-10 text-[var(--color-muted-foreground)]">
            <CalendarOff className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin bloqueos para este día</p>
          </div>
        ) : (
          Object.entries(bloqueosPorProfesional).map(([nombre, lista]) => (
            <div key={nombre} className="space-y-2">
              <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                {nombre}
              </p>
              {lista.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50"
                >
                  <BanIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-amber-800">
                      {b.hora_inicio?.slice(0, 5)} – {b.hora_fin?.slice(0, 5)} hs
                    </span>
                    {b.motivo && (
                      <p className="text-xs text-amber-600 truncate mt-0.5">{b.motivo}</p>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarBloqueo(b.id, b.motivo)}
                    title="Eliminar bloqueo"
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
