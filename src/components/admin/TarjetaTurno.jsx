import { useState, useEffect } from 'react'
import { Phone, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { turnosService } from '@/services/turnos'
import { ModalEditarTurno } from './ModalEditarTurno'
import { cn } from '@/lib/utils'

const ESTADO_VARIANT = {
  pendiente: 'pending',
  confirmado: 'success',
  cancelado: 'destructive',
  completado: 'secondary',
}

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  completado: 'Completado',
}

const BORDE_ESTADO = {
  pendiente: 'border-l-blue-400',
  confirmado: 'border-l-emerald-400',
  cancelado: 'border-l-gray-300',
  completado: 'border-l-violet-400',
}

export function TarjetaTurno({ turno, onActualizar }) {
  const [loading, setLoading] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cancelado = turno.estado === 'cancelado'

  useEffect(() => {
    if (!confirmDelete) return
    const t = setTimeout(() => setConfirmDelete(false), 3000)
    return () => clearTimeout(t)
  }, [confirmDelete])

  const cambiarEstado = async (nuevoEstado) => {
    try {
      setLoading(true)
      await turnosService.actualizarEstado(turno.id, nuevoEstado)
      onActualizar?.()
    } catch (e) {
      toast.error('No se pudo actualizar el turno', { description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    try {
      setLoading(true)
      await turnosService.eliminarTurno(turno.id)
      toast.success('Turno eliminado')
      onActualizar?.()
    } catch (e) {
      toast.error('No se pudo eliminar el turno', { description: e.message })
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-[40px_1fr_auto] items-center gap-3 px-3 py-3 rounded-xl border-y border-r border-l-4 bg-white transition-shadow hover:shadow-sm',
          BORDE_ESTADO[turno.estado] ?? 'border-l-gray-200',
          'border-y-[var(--color-border)] border-r-[var(--color-border)]',
          cancelado && 'opacity-55'
        )}
      >
        {/* Hora */}
        <div className="text-center">
          <p className="text-sm font-bold tabular-nums leading-none text-[var(--color-foreground)]">
            {turno.hora?.slice(0, 5)}
          </p>
          <p className="text-[10px] text-[var(--color-muted-foreground)] leading-none mt-0.5">hs</p>
        </div>

        {/* Info – min-w-0 is essential for truncate to work inside grid */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-semibold text-[var(--color-foreground)] truncate">
              {turno.nombre}
            </span>
            <Badge
              variant={ESTADO_VARIANT[turno.estado] ?? 'secondary'}
              className="text-[10px] flex-shrink-0"
            >
              {ESTADO_LABEL[turno.estado] ?? turno.estado}
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] truncate mt-0.5">
            {turno.servicios?.nombre}
            {turno.profesionales?.nombre ? ` · ${turno.profesionales.nombre}` : ''}
            {turno.servicios?.duracion_minutos ? ` · ${turno.servicios.duracion_minutos} min` : ''}
          </p>
          {turno.whatsapp && (
            <a
              href={`https://wa.me/54${turno.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-0.5"
            >
              <Phone className="h-3 w-3" />
              {turno.whatsapp}
            </a>
          )}
        </div>

        {/* Actions – grid auto column keeps this column fixed regardless of content */}
        <div className="flex items-center gap-0.5">
          {!cancelado && (
            <>
              <button
                onClick={() => setModalEditar(true)}
                disabled={loading}
                title="Mover turno"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-40"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>

              {turno.estado === 'pendiente' && (
                <button
                  onClick={() => cambiarEstado('confirmado')}
                  disabled={loading}
                  title="Confirmar"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                onClick={() => cambiarEstado('cancelado')}
                disabled={loading}
                title="Cancelar turno"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-40"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          <button
            onClick={handleEliminar}
            disabled={loading}
            title={confirmDelete ? 'Clic para confirmar eliminación' : 'Eliminar turno'}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40',
              confirmDelete
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-red-400 hover:bg-red-50'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ModalEditarTurno
        turno={turno}
        open={modalEditar}
        onOpenChange={setModalEditar}
        onGuardar={onActualizar}
      />
    </>
  )
}
