import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { turnoEditSchema } from '@/lib/validations'
import { turnosService } from '@/services/turnos'
import { useProfesionales } from '@/hooks/useServicios'
import { cn } from '@/lib/utils'

export function ModalEditarTurno({ turno, open, onOpenChange, onGuardar }) {
  const { profesionales } = useProfesionales(false)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(turnoEditSchema),
    defaultValues: {
      profesional_id: turno.profesional_id,
      fecha: turno.fecha,
      hora: '',
    },
  })

  const profesionalId = watch('profesional_id')
  const fechaSeleccionada = watch('fecha')
  const horaSeleccionada = watch('hora')

  // Cargar slots disponibles cuando cambia profesional o fecha
  useEffect(() => {
    if (!profesionalId || !fechaSeleccionada || !turno.servicio_id) return
    setSlots([])
    setLoadingSlots(true)
    turnosService
      .obtenerHorariosDisponibles(
        profesionalId,
        turno.servicio_id,
        new Date(fechaSeleccionada + 'T00:00:00'),
        turno.id // excluye el turno actual del cálculo de ocupados
      )
      .then((s) => {
        // Siempre incluir la hora original si el profesional/fecha no cambiaron
        const horaOriginal = turno.hora?.slice(0, 5)
        const mismoProf = profesionalId === turno.profesional_id
        const mismaFecha = fechaSeleccionada === turno.fecha
        if (mismoProf && mismaFecha && horaOriginal && !s.includes(horaOriginal)) {
          setSlots([horaOriginal, ...s].sort())
        } else {
          setSlots(s)
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [profesionalId, fechaSeleccionada, turno.id, turno.servicio_id, turno.profesional_id, turno.fecha, turno.hora])

  const onSubmit = async (datos) => {
    try {
      await turnosService.moverTurno(turno.id, datos)
      toast.success('Turno actualizado')
      onOpenChange(false)
      onGuardar?.()
    } catch (e) {
      toast.error('No se pudo mover el turno', { description: e.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mover turno — {turno.nombre}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Profesional */}
          <div className="space-y-1.5">
            <Label>Profesional</Label>
            <select
              className="w-full h-10 rounded-lg border border-[var(--color-input)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              {...register('profesional_id')}
            >
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}{!p.activo ? ' (inactivo)' : ''}</option>
              ))}
            </select>
            {errors.profesional_id && <p className="text-xs text-red-500">{errors.profesional_id.message}</p>}
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input type="date" {...register('fecha')} />
            {errors.fecha && <p className="text-xs text-red-500">{errors.fecha.message}</p>}
          </div>

          {/* Slots de hora */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Nuevo horario
            </Label>
            {loadingSlots ? (
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-3">
                Sin horarios disponibles para este día
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {slots.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setValue('hora', h, { shouldValidate: true })}
                    className={cn(
                      'h-10 rounded-lg text-sm font-medium border-2 transition-all active:scale-95',
                      horaSeleccionada === h
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : h === turno.hora?.slice(0, 5)
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] text-[var(--color-foreground)]'
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
            {errors.hora && <p className="text-xs text-red-500">{errors.hora.message}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !horaSeleccionada} className="flex-1">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</> : 'Guardar cambio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
