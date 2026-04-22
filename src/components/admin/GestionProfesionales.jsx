import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, UserCheck, UserX, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { profesionalSchema } from '@/lib/validations'
import { profesionalesService } from '@/services/servicios'
import { cn } from '@/lib/utils'

export function GestionProfesionales({ profesionales, onActualizar }) {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [editando, setEditando] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(profesionalSchema), defaultValues: { activo: true } })

  const abrirCrear = () => {
    setEditando(null)
    reset({ activo: true })
    setDialogAbierto(true)
  }

  const abrirEditar = (p) => {
    setEditando(p)
    reset({ nombre: p.nombre, especialidad: p.especialidad || '', activo: p.activo })
    setDialogAbierto(true)
  }

  const guardar = async (datos) => {
    try {
      if (editando) {
        await profesionalesService.actualizar(editando.id, datos)
        toast.success('Profesional actualizado')
      } else {
        await profesionalesService.crear(datos)
        toast.success('Profesional creado')
      }
      setDialogAbierto(false)
      onActualizar?.()
    } catch (e) {
      toast.error('Error al guardar', { description: e.message })
    }
  }

  const toggleActivo = async (p) => {
    try {
      if (p.activo) {
        await profesionalesService.desactivar(p.id)
        toast.success(`${p.nombre} desactivado`)
      } else {
        await profesionalesService.activar(p.id)
        toast.success(`${p.nombre} activado`)
      }
      onActualizar?.()
    } catch (e) {
      toast.error('Error al cambiar estado', { description: e.message })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Profesionales</h2>
        <Button size="sm" onClick={abrirCrear}>
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </div>

      <div className="grid gap-3">
        {profesionales.length === 0 && (
          <p className="text-sm text-center text-[var(--color-muted-foreground)] py-6">
            No hay profesionales registrados
          </p>
        )}
        {profesionales.map((p) => (
          <div
            key={p.id}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border bg-white transition-opacity',
              !p.activo && 'opacity-60'
            )}
          >
            {/* Avatar inicial */}
            <div className="h-9 w-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                {p.nombre.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--color-foreground)] truncate">{p.nombre}</span>
                <Badge variant={p.activo ? 'success' : 'secondary'}>
                  {p.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              {p.especialidad && (
                <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{p.especialidad}</p>
              )}
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => abrirEditar(p)}
                title="Editar"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleActivo(p)}
                title={p.activo ? 'Desactivar' : 'Activar'}
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                  p.activo
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                )}
              >
                {p.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar profesional' : 'Nuevo profesional'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(guardar)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input placeholder="Nombre completo" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Especialidad <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span></Label>
              <Input placeholder="Ej: Colorimetría, Barbería..." {...register('especialidad')} />
            </div>
            {editando && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-secondary)]">
                <input type="checkbox" id="activo" {...register('activo')} className="h-4 w-4 accent-[var(--color-primary)]" />
                <Label htmlFor="activo" className="cursor-pointer">Profesional activo</Label>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
