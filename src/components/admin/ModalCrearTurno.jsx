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
import { turnoAdminSchema } from '@/lib/validations'
import { turnosService } from '@/services/turnos'
import { useServicios, useProfesionales } from '@/hooks/useServicios'
import { cn } from '@/lib/utils'

export function ModalCrearTurno({ open, onOpenChange, onCreado }) {
  const { servicios } = useServicios(false)
  const { profesionales } = useProfesionales(false)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(turnoAdminSchema),
    defaultValues: {
      nombre: '',
      whatsapp: '',
      servicio_id: '',
      profesional_id: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: '',
      notas: '',
    },
  })

  const servicioId = watch('servicio_id')
  const profesionalId = watch('profesional_id')
  const fechaSeleccionada = watch('fecha')
  const horaSeleccionada = watch('hora')

  useEffect(() => {
    if (!profesionalId || !fechaSeleccionada || !servicioId) {
      setSlots([])
      return
    }
    setSlots([])
    setValue('hora', '', { shouldValidate: false })
    setLoadingSlots(true)
    turnosService
      .obtenerHorariosDisponibles(profesionalId, servicioId, new Date(fechaSeleccionada + 'T00:00:00'))
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [profesionalId, fechaSeleccionada, servicioId, setValue])

  const onSubmit = async (datos) => {
    try {
      await turnosService.crearTurno({
        nombre: datos.nombre,
        whatsapp: datos.whatsapp || null,
        notas: datos.notas || null,
        servicio_id: datos.servicio_id,
        profesional_id: datos.profesional_id,
        fecha: new Date(datos.fecha + 'T00:00:00'),
        hora: datos.hora,
      })
      toast.success('Turno creado')
      reset({ fecha: format(new Date(), 'yyyy-MM-dd') })
      setSlots([])
      onOpenChange(false)
      onCreado?.()
    } catch (e) {
      toast.error('No se pudo crear el turno', { description: e.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label>Nombre del cliente</Label>
            <Input placeholder="Nombre y apellido" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <Label>
              WhatsApp{' '}
              <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span>
            </Label>
            <Input placeholder="+54 9 11 1234-5678" {...register('whatsapp')} />
          </div>

          {/* Servicio */}
          <div className="space-y-1.5">
            <Label>Servicio</Label>
            <select
              className="w-full h-10 rounded-lg border border-[var(--color-input)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              {...register('servicio_id')}
            >
              <option value="">— Seleccioná un servicio —</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            {errors.servicio_id && <p className="text-xs text-red-500">{errors.servicio_id.message}</p>}
          </div>

          {/* Profesional */}
          <div className="space-y-1.5">
            <Label>Profesional</Label>
            <select
              className="w-full h-10 rounded-lg border border-[var(--color-input)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              {...register('profesional_id')}
            >
              <option value="">— Seleccioná un profesional —</option>
              {profesionales
                .filter((p) => p.activo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
            </select>
            {errors.profesional_id && (
              <p className="text-xs text-red-500">{errors.profesional_id.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input type="date" {...register('fecha')} />
            {errors.fecha && <p className="text-xs text-red-500">{errors.fecha.message}</p>}
          </div>

          {/* Horario */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horario
            </Label>
            {!servicioId || !profesionalId ? (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-3 rounded-lg bg-[var(--color-secondary)]">
                Seleccioná servicio y profesional primero
              </p>
            ) : loadingSlots ? (
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-3 rounded-lg bg-[var(--color-secondary)]">
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

          {/* Notas */}
          <div className="space-y-1.5">
            <Label>
              Notas{' '}
              <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span>
            </Label>
            <Input placeholder="Indicaciones, observaciones..." {...register('notas')} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !horaSeleccionada} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear turno'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
