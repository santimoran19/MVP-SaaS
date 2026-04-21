import { useState } from 'react'
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarDays,
  LayoutDashboard,
  Scissors,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TarjetaTurno } from '@/components/admin/TarjetaTurno'
import { CalendarioSemana } from '@/components/admin/CalendarioSemana'
import { GestionServicios } from '@/components/admin/GestionServicios'
import { useTurnosDia, useTurnosSemana } from '@/hooks/useTurnos'
import { useServicios } from '@/hooks/useServicios'
import { cn } from '@/lib/utils'

const VISTAS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'servicios', label: 'Servicios', icon: Scissors },
]

export function AdminPage() {
  const [vista, setVista] = useState('dashboard')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [semanaActual, setSemanaActual] = useState(new Date())

  const inicioSemana = startOfWeek(semanaActual, { weekStartsOn: 1 })
  const finSemana = endOfWeek(semanaActual, { weekStartsOn: 1 })

  const { turnos: turnosDia, loading: loadingDia, recargar: recargarDia } = useTurnosDia(fechaSeleccionada)
  const { turnos: turnosSemana } = useTurnosSemana(inicioSemana, finSemana)
  const { servicios, recargar: recargarServicios } = useServicios(false)

  const turnosPendientes = turnosDia.filter((t) => t.estado === 'pendiente').length
  const turnosConfirmados = turnosDia.filter((t) => t.estado === 'confirmado').length
  const turnosCancelados = turnosDia.filter((t) => t.estado === 'cancelado').length

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Sidebar desktop / Bottom nav mobile */}
      <div className="flex">
        {/* Sidebar — visible en desktop */}
        <aside className="hidden lg:flex flex-col w-56 min-h-screen border-r border-[var(--color-border)] bg-white p-4 gap-1 fixed">
          <div className="flex items-center gap-2 px-2 py-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[var(--color-foreground)]">TurnoApp</span>
          </div>
          {VISTAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setVista(id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                vista === id
                  ? 'bg-blue-50 text-[var(--color-primary)]'
                  : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 lg:ml-56 pb-20 lg:pb-0">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[var(--color-border)] px-4 lg:px-8 h-14 flex items-center justify-between">
            <h1 className="font-semibold text-[var(--color-foreground)]">
              {VISTAS.find((v) => v.id === vista)?.label}
            </h1>
            <span className="text-sm text-[var(--color-muted-foreground)] capitalize">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </span>
          </header>

          <div className="px-4 lg:px-8 py-6">
            {vista === 'dashboard' && (
              <DashboardVista
                turnosDia={turnosDia}
                loading={loadingDia}
                fechaSeleccionada={fechaSeleccionada}
                pendientes={turnosPendientes}
                confirmados={turnosConfirmados}
                cancelados={turnosCancelados}
                onActualizar={recargarDia}
              />
            )}
            {vista === 'calendario' && (
              <CalendarioVista
                turnosSemana={turnosSemana}
                semanaActual={semanaActual}
                onSemanaAnterior={() => setSemanaActual(subWeeks(semanaActual, 1))}
                onSemanaSiguiente={() => setSemanaActual(addWeeks(semanaActual, 1))}
                onDiaSeleccionado={(dia) => { setFechaSeleccionada(dia); setVista('dashboard') }}
              />
            )}
            {vista === 'servicios' && (
              <GestionServicios servicios={servicios} onActualizar={recargarServicios} />
            )}
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] flex z-20">
        {VISTAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setVista(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
              vista === id ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function DashboardVista({ turnosDia, loading, fechaSeleccionada, pendientes, confirmados, cancelados, onActualizar }) {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          label="Pendientes"
          value={pendientes}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          color="text-blue-600"
        />
        <KpiCard
          label="Confirmados"
          value={confirmados}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          color="text-emerald-600"
        />
        <KpiCard
          label="Cancelados"
          value={cancelados}
          icon={<XCircle className="h-4 w-4 text-red-400" />}
          color="text-red-500"
        />
      </div>

      {/* Lista de turnos del día */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
          Turnos de hoy — {format(fechaSeleccionada, "d 'de' MMMM", { locale: es })}
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : turnosDia.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-muted-foreground)]">
            <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay turnos para hoy</p>
          </div>
        ) : (
          <div className="space-y-2">
            {turnosDia.map((turno) => (
              <TarjetaTurno key={turno.id} turno={turno} onActualizar={onActualizar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CalendarioVista({ turnosSemana, semanaActual, onSemanaAnterior, onSemanaSiguiente, onDiaSeleccionado }) {
  return (
    <div className="space-y-4">
      <CalendarioSemana
        turnos={turnosSemana}
        semanaActual={semanaActual}
        onSemanaAnterior={onSemanaAnterior}
        onSemanaSiguiente={onSemanaSiguiente}
        onDiaSeleccionado={onDiaSeleccionado}
      />
    </div>
  )
}

function KpiCard({ label, value, icon, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
        </div>
        <span className={cn('text-2xl font-bold', color)}>{value}</span>
      </CardContent>
    </Card>
  )
}
