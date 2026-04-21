import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const HORAS_GRILLA = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`)

export function CalendarioSemana({ turnos, semanaActual, onSemanaAnterior, onSemanaSiguiente, onDiaSeleccionado }) {
  const diasSemana = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(semanaActual, { weekStartsOn: 1 }), i)
  )

  const getTurnosDia = (dia) =>
    turnos.filter((t) => isSameDay(new Date(t.fecha + 'T00:00:00'), dia))

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden">
      {/* Header semana */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <Button variant="ghost" size="icon" onClick={onSemanaAnterior}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">
          {format(diasSemana[0], "d 'de' MMMM", { locale: es })} –{' '}
          {format(diasSemana[6], "d 'de' MMMM yyyy", { locale: es })}
        </span>
        <Button variant="ghost" size="icon" onClick={onSemanaSiguiente}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Días */}
      <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
        {diasSemana.map((dia) => {
          const turnosDia = getTurnosDia(dia)
          const esHoy = isSameDay(dia, new Date())
          return (
            <button
              key={dia.toISOString()}
              onClick={() => onDiaSeleccionado?.(dia)}
              className={cn(
                'flex flex-col items-center py-3 gap-1 hover:bg-[var(--color-secondary)] transition-colors',
                esHoy && 'bg-blue-50/50'
              )}
            >
              <span className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase">
                {format(dia, 'EEE', { locale: es })}
              </span>
              <span
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  esHoy
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-foreground)]'
                )}
              >
                {format(dia, 'd')}
              </span>
              {turnosDia.length > 0 && (
                <span className="text-[10px] font-medium text-[var(--color-primary)]">
                  {turnosDia.length} turno{turnosDia.length > 1 ? 's' : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Grilla de horas — scroll horizontal en mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {HORAS_GRILLA.map((hora) => (
            <div
              key={hora}
              className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-[var(--color-border)] last:border-0 min-h-[40px]"
            >
              <div className="flex items-start pt-1 px-1">
                <span className="text-[10px] text-[var(--color-muted-foreground)]">{hora}</span>
              </div>
              {diasSemana.map((dia) => {
                const turnosHora = getTurnosDia(dia).filter(
                  (t) => t.hora?.slice(0, 2) === hora.slice(0, 2)
                )
                return (
                  <div key={dia.toISOString()} className="border-l border-[var(--color-border)] p-0.5">
                    {turnosHora.map((t) => (
                      <div
                        key={t.id}
                        className="rounded text-[10px] font-medium bg-blue-100 text-blue-700 px-1 py-0.5 truncate cursor-pointer hover:bg-blue-200 transition-colors"
                        title={`${t.nombre} — ${t.servicios?.nombre}`}
                      >
                        {t.nombre}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
