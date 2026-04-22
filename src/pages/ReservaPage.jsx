import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, Scissors, Plus, Home } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { BookingStepper } from '@/components/booking/BookingStepper'
import { PasoServicio } from '@/components/booking/PasoServicio'
import { PasoProfesional } from '@/components/booking/PasoProfesional'
import { PasoFechaHora } from '@/components/booking/PasoFechaHora'
import { PasoConfirmacion } from '@/components/booking/PasoConfirmacion'
import { useServicios, useProfesionales } from '@/hooks/useServicios'
import { useHorariosDisponibles, useCrearTurno } from '@/hooks/useTurnos'

const PASOS = ['Servicio', 'Profesional', 'Fecha y hora', 'Confirmación']

export function ReservaPage() {
  const [pasoActual, setPasoActual] = useState(0)
  const [reservaCompleta, setReservaCompleta] = useState(null)

  const [servicio, setServicio] = useState(null)
  const [profesional, setProfesional] = useState(null)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null)

  const { servicios, loading: loadingServicios } = useServicios()
  const { profesionales, loading: loadingProfesionales } = useProfesionales()
  const { horarios, loading: loadingHorarios } = useHorariosDisponibles(
    profesional?.id,
    servicio?.id,
    fecha
  )
  const { crear: crearTurno, loading: loadingConfirmar } = useCrearTurno()

  const puedeAvanzar = () => {
    if (pasoActual === 0) return !!servicio
    if (pasoActual === 1) return !!profesional
    if (pasoActual === 2) return !!fecha && !!hora
    return false
  }

  const avanzar = () => {
    if (puedeAvanzar()) setPasoActual((p) => p + 1)
  }

  const retroceder = () => {
    if (pasoActual === 0) return
    setPasoActual((p) => p - 1)
    if (pasoActual === 2) { setFecha(null); setHora(null) }
    if (pasoActual === 1) setProfesional(null)
  }

  const handleFechaChange = (nuevaFecha) => {
    setFecha(nuevaFecha)
    setHora(null)
  }

  const handleConfirmar = async (datos) => {
    const turno = await crearTurno({
      ...datos,
      servicio_id: servicio.id,
      profesional_id: profesional.id,
      fecha,
      hora,
    })
    setReservaCompleta(turno)
  }

  const resetReserva = () => {
    setReservaCompleta(null)
    setPasoActual(0)
    setServicio(null)
    setProfesional(null)
    setFecha(null)
    setHora(null)
  }

  if (reservaCompleta) {
    return (
      <PantallaExito
        servicio={servicio}
        profesional={profesional}
        fecha={fecha}
        hora={hora}
        onNuevaTurno={resetReserva}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[var(--color-foreground)]">Reservar turno</span>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Stepper */}
        <BookingStepper pasos={PASOS} pasoActual={pasoActual} />

        {/* Título del paso actual */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {PASOS[pasoActual]}
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            {pasoActual === 0 && 'Elegí el servicio que querés'}
            {pasoActual === 1 && 'Elegí con quién querés atenderte'}
            {pasoActual === 2 && 'Elegí el día y el horario'}
            {pasoActual === 3 && 'Completá tus datos para confirmar'}
          </p>
        </div>

        {/* Contenido del paso */}
        <div className="min-h-[320px]">
          {pasoActual === 0 && (
            <PasoServicio
              servicios={servicios}
              loading={loadingServicios}
              seleccionado={servicio}
              onSeleccionar={setServicio}
            />
          )}
          {pasoActual === 1 && (
            <PasoProfesional
              profesionales={profesionales}
              loading={loadingProfesionales}
              seleccionado={profesional}
              onSeleccionar={setProfesional}
            />
          )}
          {pasoActual === 2 && (
            <PasoFechaHora
              fecha={fecha}
              hora={hora}
              horarios={horarios}
              loadingHorarios={loadingHorarios}
              onFechaChange={handleFechaChange}
              onHoraChange={setHora}
            />
          )}
          {pasoActual === 3 && (
            <PasoConfirmacion
              servicio={servicio}
              profesional={profesional}
              fecha={fecha}
              hora={hora}
              loading={loadingConfirmar}
              onConfirmar={handleConfirmar}
            />
          )}
        </div>

        {/* Navegación */}
        {pasoActual < 3 && (
          <div className="flex gap-3 pt-2">
            {pasoActual > 0 ? (
              <Button variant="outline" onClick={retroceder} className="flex-none px-4">
                <ChevronLeft className="h-4 w-4" />
                Volver
              </Button>
            ) : null}
            <Button
              onClick={avanzar}
              disabled={!puedeAvanzar()}
              className="flex-1 h-11"
            >
              Continuar
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Botón volver en paso 3 (el submit está dentro de PasoConfirmacion) */}
        {pasoActual === 3 && (
          <Button variant="outline" onClick={retroceder} className="w-full" disabled={loadingConfirmar}>
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
        )}
      </div>
      </div>

      {/* Footer */}
      <footer className="max-w-screen-xl mx-auto px-4 py-6 flex justify-center">
        <a
          href="/login"
          className="text-xs text-[var(--color-border)] hover:text-[var(--color-muted-foreground)] transition-colors"
        >
          Acceso Administración
        </a>
      </footer>
    </div>
  )
}

function PantallaExito({ servicio, profesional, fecha, hora, onNuevaTurno }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-4">
        {/* Icono de éxito */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        {/* Título */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">¡Turno confirmado!</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Guardá estos datos para recordar tu cita
          </p>
        </div>

        {/* Ticket */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          {/* Header del ticket */}
          <div className="bg-[var(--color-primary)] px-5 py-4 text-white text-center">
            <p className="text-xs font-medium uppercase tracking-widest opacity-80">Reserva confirmada</p>
            <p className="text-2xl font-bold mt-1">{hora} hs</p>
            <p className="text-sm opacity-90 capitalize mt-0.5">
              {fecha &&
                new Intl.DateTimeFormat('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(fecha)}
            </p>
          </div>

          {/* Borde de ticket perforado */}
          <div className="flex items-center px-2">
            <div className="h-4 w-4 rounded-full bg-[var(--color-background)] -ml-4 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-[var(--color-border)]" />
            <div className="h-4 w-4 rounded-full bg-[var(--color-background)] -mr-4 flex-shrink-0" />
          </div>

          {/* Detalles */}
          <div className="px-5 py-4 space-y-3">
            <TicketRow label="Servicio" value={servicio?.nombre} />
            <TicketRow label="Con" value={profesional?.nombre} />
            {servicio?.precio > 0 && (
              <TicketRow
                label="Precio"
                value={`$${servicio.precio.toLocaleString('es-AR')}`}
                highlight
              />
            )}
          </div>
        </div>

        <p className="text-xs text-center text-[var(--color-muted-foreground)]">
          Para cancelar o modificar, contactanos por WhatsApp.
        </p>

        {/* Acciones */}
        <div className="flex flex-col gap-2.5">
          <Button onClick={onNuevaTurno} className="h-12 text-sm font-semibold w-full">
            <Plus className="h-4 w-4" />
            Pedir otro turno
          </Button>
        </div>
      </div>
    </div>
  )
}

function TicketRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
      <span className={highlight
        ? 'text-sm font-bold text-[var(--color-primary)]'
        : 'text-sm font-medium text-[var(--color-foreground)] text-right'
      }>
        {value}
      </span>
    </div>
  )
}
