import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const HORAS_GRILLA = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`)

const ESTADO_VARIANT = { pendiente: 'pending', confirmado: 'success', cancelado: 'destructive' }

export function CalendarioSemana({ turnos, semanaActual, onSemanaAnterior, onSemanaSiguiente, onDiaSeleccionado }) {
  const diasSemana = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(semanaActual, { weekStartsOn: 1 }), i)
  )

  const [diaActivoMobile, setDiaActivoMobile] = useState(() => {
    const hoy = new Date()
    return diasSemana.find((d) => isSameDay(d, hoy)) ?? diasSemana[0]
  })

  const getTurnosDia = (dia) =>
    turnos.filter((t) => isSameDay(new Date(t.fecha + 'T00:00:00'), dia))

  // Sync diaActivoMobile when week changes
  const handleSemanaAnterior = () => {
    onSemanaAnterior()
    setDiaActivoMobile(addDays(startOfWeek(semanaActual, { weekStartsOn: 1 }), -7))
  }
  const handleSemanaSiguiente = () => {
    onSemanaSiguiente()
    setDiaActivoMobile(addDays(startOfWeek(semanaActual, { weekStartsOn: 1 }), 7))
  }

  const NavHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
      <Button variant="ghost" size="icon" onClick={handleSemanaAnterior}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold capitalize">
        {format(diasSemana[0], "d MMM", { locale: es })} –{' '}
        {format(diasSemana[6], "d MMM yyyy", { locale: es })}
      </span>
      <Button variant="ghost" size="icon" onClick={handleSemanaSiguiente}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden max-w-4xl w-full">
      <NavHeader />

      {/* ═══════════════════════════════════════
          VISTA MOBILE — selector de día + lista
          ═══════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Selector de días */}
        <div className="flex border-b border-[var(--color-border)] overflow-x-auto">
          {diasSemana.map((dia) => {
            const turnosDia = getTurnosDia(dia)
            const esHoy = isSameDay(dia, new Date())
            const activo = isSameDay(dia, diaActivoMobile)
            return (
              <button
                key={dia.toISOString()}
                onClick={() => setDiaActivoMobile(dia)}
                className={cn(
                  'flex flex-col items-center py-3 px-3 gap-1 min-w-[52px] flex-1 transition-colors',
                  activo ? 'bg-blue-50' : 'hover:bg-[var(--color-secondary)]'
                )}
              >
                <span className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase">
                  {format(dia, 'EEE', { locale: es })}
                </span>
                <span
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                    esHoy ? 'bg-[var(--color-primary)] text-white'
                      : activo ? 'bg-blue-100 text-[var(--color-primary)]'
                      : 'text-[var(--color-foreground)]'
                  )}
                >
                  {format(dia, 'd')}
                </span>
                {turnosDia.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Lista de turnos del día activo */}
        <div className="p-4 space-y-2">
          {(() => {
            const turnosDelDia = getTurnosDia(diaActivoMobile)
            if (turnosDelDia.length === 0) {
              return (
                <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin turnos para este día</p>
                </div>
              )
            }
            return turnosDelDia.map((t) => (
              <button
                key={t.id}
                onClick={() => onDiaSeleccionado?.(diaActivoMobile)}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-secondary)] transition-colors text-left"
              >
                <div className="flex flex-col items-center min-w-[40px]">
                  <span className="text-base font-bold text-[var(--color-foreground)] leading-none">
                    {t.hora?.slice(0, 5)}
                  </span>
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">hs</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--color-foreground)] truncate">{t.nombre}</span>
                    <Badge variant={ESTADO_VARIANT[t.estado] || 'secondary'} className="text-[10px]">
                      {t.estado}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                    <span>{t.servicios?.nombre}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <User className="h-3 w-3" />
                      {t.profesionales?.nombre}
                    </span>
                  </div>
                </div>
              </button>
            ))
          })()}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          VISTA DESKTOP — grilla semanal
          ═══════════════════════════════════════ */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-[640px]">
        {/* Cabecera de días */}
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

        {/* Grilla horaria */}
        <div className="overflow-y-auto max-h-[60vh]">
          {HORAS_GRILLA.map((hora) => (
            <div
              key={hora}
              className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-[var(--color-border)] last:border-0 min-h-[44px]"
            >
              <div className="flex items-start pt-1.5 px-2">
                <span className="text-[10px] text-[var(--color-muted-foreground)]">{hora}</span>
              </div>
              {diasSemana.map((dia) => {
                const turnosHora = getTurnosDia(dia).filter(
                  (t) => t.hora?.slice(0, 2) === hora.slice(0, 2)
                )
                return (
                  <div key={dia.toISOString()} className="border-l border-[var(--color-border)] p-0.5">
                    {turnosHora.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onDiaSeleccionado?.(dia)}
                        className={cn(
                          'w-full rounded text-[10px] font-medium px-1 py-0.5 truncate text-left transition-colors',
                          t.estado === 'confirmado'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : t.estado === 'cancelado'
                            ? 'bg-gray-100 text-gray-400 line-through'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        )}
                        title={`${t.nombre} — ${t.servicios?.nombre}`}
                      >
                        {t.nombre}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
