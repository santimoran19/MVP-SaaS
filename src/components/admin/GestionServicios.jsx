import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, EyeOff, Eye, Clock, DollarSign, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { servicioSchema } from '@/lib/validations'
import { serviciosService } from '@/services/servicios'
import { cn } from '@/lib/utils'

export function GestionServicios({ servicios, onActualizar }) {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [editando, setEditando] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(servicioSchema),
    defaultValues: { activo: true },
  })

  const abrirCrear = () => {
    setEditando(null)
    reset({ activo: true, precio: 0, duracion_minutos: 30 })
    setDialogAbierto(true)
  }

  const abrirEditar = (s) => {
    setEditando(s)
    reset(s)
    setDialogAbierto(true)
  }

  const guardar = async (datos) => {
    try {
      if (editando) {
        await serviciosService.actualizar(editando.id, datos)
        toast.success('Servicio actualizado')
      } else {
        await serviciosService.crear(datos)
        toast.success('Servicio creado')
      }
      setDialogAbierto(false)
      onActualizar?.()
    } catch (e) {
      toast.error('Error al guardar', { description: e.message })
    }
  }

  const toggleActivo = async (s) => {
    try {
      if (s.activo) {
        await serviciosService.desactivar(s.id)
        toast.success(`"${s.nombre}" desactivado`)
      } else {
        await serviciosService.activar(s.id)
        toast.success(`"${s.nombre}" activado`)
      }
      onActualizar?.()
    } catch (e) {
      toast.error('Error al cambiar estado', { description: e.message })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Servicios</h2>
        <Button size="sm" onClick={abrirCrear}>
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </div>

      <div className="grid gap-3">
        {servicios.length === 0 && (
          <p className="text-sm text-center text-[var(--color-muted-foreground)] py-6">
            No hay servicios registrados
          </p>
        )}
        {servicios.map((s) => (
          <div
            key={s.id}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border bg-white',
              !s.activo && 'opacity-60'
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--color-foreground)] truncate">{s.nombre}</span>
                {!s.activo && <Badge variant="secondary">Inactivo</Badge>}
              </div>
              {s.descripcion && (
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 truncate">{s.descripcion}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-sm text-[var(--color-muted-foreground)]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {s.duracion_minutos} min
                </span>
                <span className="flex items-center gap-1 font-medium text-[var(--color-foreground)]">
                  <DollarSign className="h-3.5 w-3.5" />
                  {s.precio?.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => abrirEditar(s)}
                title="Editar"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleActivo(s)}
                title={s.activo ? 'Desactivar' : 'Activar'}
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                  s.activo ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                )}
              >
                {s.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(guardar)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input placeholder="Corte de cabello" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span></Label>
              <Input placeholder="Breve descripción del servicio" {...register('descripcion')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  min="10"
                  step="5"
                  {...register('duracion_minutos', { valueAsNumber: true })}
                />
                {errors.duracion_minutos && (
                  <p className="text-xs text-red-500">{errors.duracion_minutos.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Precio ($)</Label>
                <Input
                  type="number"
                  min="0"
                  {...register('precio', { valueAsNumber: true })}
                />
                {errors.precio && <p className="text-xs text-red-500">{errors.precio.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
