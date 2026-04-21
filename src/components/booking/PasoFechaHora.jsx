import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { isBefore, startOfDay } from 'date-fns'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-day-picker/style.css'

export function PasoFechaHora({ fecha, hora, horarios, loadingHorarios, onFechaChange, onHoraChange }) {
  const hoy = startOfDay(new Date())

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:gap-6 gap-5">
        {/* ── Calendario ── */}
        <div className="flex-shrink-0">
          <p className="text-sm font-medium text-[var(--color-foreground)] mb-3">
            Seleccioná una fecha
          </p>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-3 inline-block shadow-sm">
            <DayPicker
              mode="single"
              selected={fecha}
              onSelect={onFechaChange}
              locale={es}
              disabled={(date) => isBefore(date, hoy)}
            />
          </div>
        </div>

        {/* ── Horarios ── */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-foreground)] mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios disponibles
          </p>

          {!fecha ? (
            <div className="flex flex-col items-center justify-center h-36 text-center">
              <Clock className="h-10 w-10 text-[var(--color-border)] mb-2" />
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Seleccioná una fecha<br />para ver los horarios
              </p>
            </div>
          ) : loadingHorarios ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : horarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-center">
              <Clock className="h-10 w-10 text-[var(--color-border)] mb-2" />
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No hay horarios disponibles<br />para este día
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {horarios.map((h) => (
                <button
                  key={h}
                  onClick={() => onHoraChange(h)}
                  className={cn(
                    'h-10 rounded-lg text-sm font-medium border-2 transition-all duration-150 active:scale-95',
                    hora === h
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm'
                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-foreground)]'
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
