import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarDays,
  LayoutDashboard,
  Scissors,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  CalendarOff,
  Plus,
  AlarmClock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { TarjetaTurno } from '@/components/admin/TarjetaTurno'
import { CalendarioSemana } from '@/components/admin/CalendarioSemana'
import { GestionServicios } from '@/components/admin/GestionServicios'
import { GestionProfesionales } from '@/components/admin/GestionProfesionales'
import { GestionDisponibilidad } from '@/components/admin/GestionDisponibilidad'
import { GestionHorarios } from '@/components/admin/GestionHorarios'
import { ModalCrearTurno } from '@/components/admin/ModalCrearTurno'
import { useTurnosDia, useTurnosSemana } from '@/hooks/useTurnos'
import { useServicios, useProfesionales } from '@/hooks/useServicios'
import { cn } from '@/lib/utils'

const VISTAS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'catalogo', label: 'Catálogo', icon: Scissors },
  { id: 'horarios', label: 'Horarios', icon: AlarmClock },
  { id: 'disponibilidad', label: 'Bloqueos', icon: CalendarOff },
]

const CATALOGO_TABS = [
  { id: 'servicios', label: 'Servicios', icon: Scissors },
  { id: 'profesionales', label: 'Profesionales', icon: LayoutDashboard },
]

export function AdminPage() {
  const [vista, setVista] = useState('dashboard')
  const [catalogoTab, setCatalogoTab] = useState('servicios')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [semanaActual, setSemanaActual] = useState(new Date())
  const navigate = useNavigate()

  const inicioSemana = startOfWeek(semanaActual, { weekStartsOn: 1 })
  const finSemana = endOfWeek(semanaActual, { weekStartsOn: 1 })

  const { turnos: turnosDia, loading: loadingDia, recargar: recargarDia } = useTurnosDia(fechaSeleccionada)
  const { turnos: turnosSemana } = useTurnosSemana(inicioSemana, finSemana)
  const { servicios, recargar: recargarServicios } = useServicios(false)
  const { profesionales, recargar: recargarProfesionales } = useProfesionales(false)

  const turnosPendientes  = turnosDia.filter((t) => t.estado === 'pendiente').length
  const turnosConfirmados = turnosDia.filter((t) => t.estado === 'confirmado').length
  const turnosCancelados  = turnosDia.filter((t) => t.estado === 'cancelado').length
  const facturacionEstimada = turnosDia
    .filter((t) => t.estado === 'confirmado')
    .reduce((acc, t) => acc + (t.servicios?.precio ?? 0), 0)

  const handleActualizarTurno = async () => { await recargarDia() }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="h-screen overflow-hidden flex bg-[var(--color-background)]">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-[var(--color-border)] bg-white flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-[var(--color-border)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[var(--color-foreground)]">TurnoApp</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {VISTAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setVista(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                vista === id
                  ? 'bg-blue-50 text-[var(--color-primary)]'
                  : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Columna principal ── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header fijo */}
        <header className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-[var(--color-border)] px-4 lg:px-8 h-14 flex items-center justify-between z-10">
          <h1 className="font-semibold text-[var(--color-foreground)]">
            {VISTAS.find((v) => v.id === vista)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-muted-foreground)] capitalize hidden sm:inline">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </span>
            <button
              onClick={handleLogout}
              className="lg:hidden flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Contenido con scroll interno */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-8 py-5 pb-24 lg:pb-8">
            {vista === 'dashboard' && (
              <DashboardVista
                turnosDia={turnosDia}
                loading={loadingDia}
                fechaSeleccionada={fechaSeleccionada}
                pendientes={turnosPendientes}
                confirmados={turnosConfirmados}
                cancelados={turnosCancelados}
                facturacion={facturacionEstimada}
                onActualizar={handleActualizarTurno}
                onCambiarFecha={(dia) => setFechaSeleccionada(dia)}
                onRecargar={recargarDia}
              />
            )}
            {vista === 'calendario' && (
              <CalendarioSemana
                turnos={turnosSemana}
                semanaActual={semanaActual}
                onSemanaAnterior={() => setSemanaActual(subWeeks(semanaActual, 1))}
                onSemanaSiguiente={() => setSemanaActual(addWeeks(semanaActual, 1))}
                onDiaSeleccionado={(dia) => { setFechaSeleccionada(dia); setVista('dashboard') }}
              />
            )}
            {vista === 'catalogo' && (
              <CatalogoVista
                tab={catalogoTab}
                onTabChange={setCatalogoTab}
                servicios={servicios}
                profesionales={profesionales}
                onActualizarServicios={recargarServicios}
                onActualizarProfesionales={recargarProfesionales}
              />
            )}
            {vista === 'horarios' && <GestionHorarios />}
            {vista === 'disponibilidad' && <GestionDisponibilidad />}
          </div>
        </main>
      </div>

      {/* ── Bottom nav mobile ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] flex z-20">
        {VISTAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setVista(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors',
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

// ─────────────────────────────────────────────────────────────
// Vista Dashboard
// ─────────────────────────────────────────────────────────────
function DashboardVista({ turnosDia, loading, fechaSeleccionada, pendientes, confirmados, cancelados, facturacion, onActualizar, onCambiarFecha, onRecargar }) {
  const [modalCrear, setModalCrear] = useState(false)

  return (
    <div className="space-y-4 max-w-2xl">
      {/* KPIs compactos */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatMini label="Pendientes"   value={pendientes}   icon={Clock}        iconClass="text-blue-400"   valueClass="text-blue-600" />
          <StatMini label="Confirmados"  value={confirmados}  icon={CheckCircle2} iconClass="text-emerald-400" valueClass="text-emerald-600" />
          <StatMini label="Cancelados"   value={cancelados}   icon={XCircle}      iconClass="text-red-400"   valueClass="text-red-500" />
          <StatMini
            label="Facturación"
            value={`$${facturacion.toLocaleString('es-AR')}`}
            icon={TrendingUp}
            iconClass="text-violet-400"
            valueClass="text-violet-600"
            small
          />
        </div>
      )}

      {/* Lista de turnos del día */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
            Turnos — {format(fechaSeleccionada, "d 'de' MMMM", { locale: es })}
          </h2>
          <input
            type="date"
            value={format(fechaSeleccionada, 'yyyy-MM-dd')}
            onChange={(e) => onCambiarFecha(new Date(e.target.value + 'T00:00:00'))}
            className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          />
        </div>

        {loading ? (
          <SkeletonTurnos />
        ) : turnosDia.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-muted-foreground)]">
            <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay turnos para este día</p>
          </div>
        ) : (
          <div className="space-y-2">
            {turnosDia.map((turno) => (
              <TarjetaTurno key={turno.id} turno={turno} onActualizar={onActualizar} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalCrear(true)}
        title="Nuevo turno"
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 h-14 w-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ModalCrearTurno
        open={modalCrear}
        onOpenChange={setModalCrear}
        onCreado={onRecargar}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Vista Catálogo
// ─────────────────────────────────────────────────────────────
function CatalogoVista({ tab, onTabChange, servicios, profesionales, onActualizarServicios, onActualizarProfesionales }) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex gap-1 bg-[var(--color-secondary)] rounded-lg p-1 w-fit">
        {CATALOGO_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === id
                ? 'bg-white text-[var(--color-foreground)] shadow-sm'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'servicios' && (
        <GestionServicios servicios={servicios} onActualizar={onActualizarServicios} />
      )}
      {tab === 'profesionales' && (
        <GestionProfesionales profesionales={profesionales} onActualizar={onActualizarProfesionales} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Auxiliares
// ─────────────────────────────────────────────────────────────
function StatMini({ label, value, icon: Icon, iconClass, valueClass, small = false }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--color-border)] bg-white flex items-center gap-2.5">
      <Icon className={cn('h-4 w-4 flex-shrink-0', iconClass)} />
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide leading-none truncate">
          {label}
        </p>
        <p className={cn('font-bold leading-tight mt-1', small ? 'text-base' : 'text-xl', valueClass)}>
          {value}
        </p>
      </div>
    </div>
  )
}

function SkeletonTurnos() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-3 flex gap-3">
          <div className="w-10 space-y-1">
            <div className="h-4 w-8 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-4 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-48 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
