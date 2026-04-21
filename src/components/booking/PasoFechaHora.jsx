import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { isBefore, startOfDay } from 'date-fns'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-day-picker/style.css'

export function PasoFechaHora({ fecha, hora, horarios, loadingHorarios, onFechaChange, onHoraChange }) {
  const hoy = startOfDay(new Date())

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--color-foreground)] mb-3">Seleccioná una fecha</p>
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={fecha}
            onSelect={onFechaChange}
            locale={es}
            disabled={(date) => isBefore(date, hoy)}
            classNames={{
              root: 'rdp-custom',
              months: 'flex flex-col',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center mb-4',
              caption_label: 'text-sm font-semibold capitalize',
              nav: 'space-x-1 flex items-center',
              nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md hover:bg-[var(--color-secondary)] transition-colors flex items-center justify-center',
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-[var(--color-muted-foreground)] rounded-md w-9 font-normal text-[0.8rem] text-center',
              row: 'flex w-full mt-2',
              cell: 'h-9 w-9 text-center text-sm p-0 relative',
              day: 'h-9 w-9 p-0 font-normal rounded-lg hover:bg-[var(--color-secondary)] transition-colors aria-selected:opacity-100 flex items-center justify-center',
              day_selected: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] hover:text-white focus:bg-[var(--color-primary)] focus:text-white rounded-lg',
              day_today: 'font-bold text-[var(--color-primary)]',
              day_outside: 'opacity-30',
              day_disabled: 'opacity-20 cursor-not-allowed hover:bg-transparent',
            }}
          />
        </div>
      </div>

      {fecha && (
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)] mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios disponibles
          </p>
          {loadingHorarios ? (
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : horarios.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] text-center py-4">
              No hay horarios disponibles para este día
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {horarios.map((h) => (
                <button
                  key={h}
                  onClick={() => onHoraChange(h)}
                  className={cn(
                    'h-10 rounded-lg text-sm font-medium border-2 transition-all duration-150 active:scale-95',
                    hora === h
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] text-[var(--color-foreground)]'
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
