import { Clock, DollarSign, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function PasoServicio({ servicios, loading, seleccionado, onSeleccionar }) {
  if (loading) {
    return (
      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {servicios.map((servicio) => (
        <button
          key={servicio.id}
          onClick={() => onSeleccionar(servicio)}
          className={cn(
            'w-full text-left rounded-xl border-2 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-sm active:scale-[0.99]',
            seleccionado?.id === servicio.id
              ? 'border-[var(--color-primary)] bg-blue-50/50'
              : 'border-[var(--color-border)] bg-white'
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <p className="font-semibold text-[var(--color-foreground)]">{servicio.nombre}</p>
              {servicio.descripcion && (
                <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{servicio.descripcion}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                  <Clock className="h-3.5 w-3.5" />
                  {servicio.duracion_minutos} min
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-foreground)]">
                  <DollarSign className="h-3.5 w-3.5" />
                  {servicio.precio.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
            <ChevronRight
              className={cn(
                'h-5 w-5 transition-colors',
                seleccionado?.id === servicio.id
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-muted-foreground)]'
              )}
            />
          </div>
        </button>
      ))}
    </div>
  )
}
