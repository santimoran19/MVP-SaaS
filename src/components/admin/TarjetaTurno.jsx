import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Phone, Clock, User, CheckCircle, XCircle, Pencil } from 'lucide-react'
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

export function TarjetaTurno({ turno, onActualizar }) {
  const [loading, setLoading] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const cancelado = turno.estado === 'cancelado'

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

  return (
    <>
      <div
        className={cn(
          'flex items-start gap-4 p-4 rounded-xl border bg-white transition-shadow hover:shadow-sm',
          cancelado ? 'border-[var(--color-border)] opacity-60' : 'border-[var(--color-border)]'
        )}
      >
        {/* Hora */}
        <div className="flex flex-col items-center min-w-[48px]">
          <span className="text-lg font-bold text-[var(--color-foreground)] leading-none">
            {turno.hora?.slice(0, 5)}
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)] mt-0.5">hs</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[var(--color-foreground)] truncate">{turno.nombre}</span>
            <Badge variant={ESTADO_VARIANT[turno.estado] || 'secondary'}>
              {ESTADO_LABEL[turno.estado] || turno.estado}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-muted-foreground)]">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {turno.servicios?.duracion_minutos} min · {turno.servicios?.nombre}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-muted-foreground)]">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {turno.profesionales?.nombre}
            </span>
            {turno.whatsapp && (
              <a
                href={`https://wa.me/54${turno.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-600 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {turno.whatsapp}
              </a>
            )}
          </div>
          {turno.notas && (
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)] italic">"{turno.notas}"</p>
          )}
        </div>

        {/* Acciones */}
        {!cancelado && (
          <div className="flex gap-1 shrink-0">
            {/* Editar / mover */}
            <button
              onClick={() => setModalEditar(true)}
              disabled={loading}
              title="Mover turno"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-40"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* Confirmar (solo pendiente) */}
            {turno.estado === 'pendiente' && (
              <button
                onClick={() => cambiarEstado('confirmado')}
                disabled={loading}
                title="Confirmar"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}

            {/* Cancelar */}
            <button
              onClick={() => cambiarEstado('cancelado')}
              disabled={loading}
              title="Cancelar turno"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
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
