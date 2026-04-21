import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Phone, Clock, User, MoreVertical, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { turnosService } from '@/services/turnos'
import { useState } from 'react'

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

  const cambiarEstado = async (nuevoEstado) => {
    try {
      setLoading(true)
      await turnosService.actualizarEstado(turno.id, nuevoEstado)
      onActualizar?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-white hover:shadow-sm transition-shadow">
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-lg font-bold text-[var(--color-foreground)] leading-none">{turno.hora?.slice(0, 5)}</span>
        <span className="text-xs text-[var(--color-muted-foreground)] mt-0.5">hs</span>
      </div>

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

      {turno.estado === 'pendiente' && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => cambiarEstado('confirmado')}
            disabled={loading}
            title="Confirmar"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => cambiarEstado('cancelado')}
            disabled={loading}
            title="Cancelar"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <XCircle className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </div>
  )
}
