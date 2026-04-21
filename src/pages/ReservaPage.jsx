import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Scissors } from 'lucide-react'
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

  if (reservaCompleta) {
    return (
      <PantallaExito
        servicio={servicio}
        profesional={profesional}
        fecha={fecha}
        hora={hora}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[var(--color-foreground)]">Reservar turno</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
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

      {/* Footer */}
      <footer className="max-w-xl mx-auto px-4 py-6 flex justify-center">
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

function PantallaExito({ servicio, profesional, fecha, hora }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">¡Turno confirmado!</h1>
          <p className="text-[var(--color-muted-foreground)]">
            Te esperamos para tu turno de <strong>{servicio?.nombre}</strong> con{' '}
            <strong>{profesional?.nombre}</strong>
          </p>
        </div>
        <div className="rounded-xl bg-[var(--color-secondary)] p-4 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Fecha</span>
            <span className="font-medium capitalize">
              {fecha &&
                new Intl.DateTimeFormat('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(fecha)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Hora</span>
            <span className="font-medium">{hora} hs</span>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Si necesitás cancelar o modificar el turno, contactanos por WhatsApp.
        </p>
      </div>
    </div>
  )
}
