import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { servicioSchema } from '@/lib/validations'
import { serviciosService } from '@/services/servicios'

export function GestionServicios({ servicios, onActualizar }) {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(servicioSchema),
    defaultValues: { activo: true },
  })

  const abrirCrear = () => {
    setEditando(null)
    reset({ activo: true })
    setDialogAbierto(true)
  }

  const abrirEditar = (servicio) => {
    setEditando(servicio)
    reset(servicio)
    setDialogAbierto(true)
  }

  const guardar = async (datos) => {
    try {
      setLoading(true)
      if (editando) {
        await serviciosService.actualizar(editando.id, datos)
      } else {
        await serviciosService.crear(datos)
      }
      setDialogAbierto(false)
      onActualizar?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return
    try {
      await serviciosService.eliminar(id)
      onActualizar?.()
    } catch (e) {
      alert(e.message)
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
        {servicios.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-white"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--color-foreground)]">{s.nombre}</span>
                {!s.activo && <Badge variant="secondary">Inactivo</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-muted-foreground)]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {s.duracion_minutos} min
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {s.precio?.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => abrirEditar(s)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => eliminar(s.id)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
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
              <Label>Descripción (opcional)</Label>
              <Input placeholder="Breve descripción del servicio" {...register('descripcion')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duración (minutos)</Label>
                <Input
                  type="number"
                  min="15"
                  step="15"
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
