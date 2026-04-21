import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Phone, Mail, MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bookingClienteSchema } from '@/lib/validations'
import { cn } from '@/lib/utils'

export function PasoConfirmacion({ servicio, profesional, fecha, hora, loading, onConfirmar }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingClienteSchema),
    defaultValues: { notas: '' },
  })

  const ocupado = loading || isSubmitting

  const onSubmit = async (datos) => {
    try {
      await onConfirmar(datos)
    } catch {
      // El error ya fue notificado vía toast por useCrearTurno.
      // No hacemos nada extra aquí para evitar duplicar mensajes.
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen del turno */}
      <div className="rounded-xl bg-[var(--color-secondary)] p-4 space-y-2">
        <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
          Resumen del turno
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <span className="text-[var(--color-muted-foreground)]">Servicio</span>
          <span className="font-medium truncate">{servicio?.nombre}</span>

          <span className="text-[var(--color-muted-foreground)]">Con</span>
          <span className="font-medium">{profesional?.nombre}</span>

          <span className="text-[var(--color-muted-foreground)]">Fecha</span>
          <span className="font-medium capitalize">
            {fecha && format(fecha, "EEEE d 'de' MMMM", { locale: es })}
          </span>

          <span className="text-[var(--color-muted-foreground)]">Hora</span>
          <span className="font-medium">{hora} hs</span>

          {servicio?.precio > 0 && (
            <>
              <span className="text-[var(--color-muted-foreground)]">Precio</span>
              <span className="font-semibold text-[var(--color-primary)]">
                ${servicio.precio.toLocaleString('es-AR')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Formulario de datos del cliente */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre */}
        <div className="space-y-1.5">
          <Label htmlFor="nombre" className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            Tu nombre completo
          </Label>
          <Input
            id="nombre"
            placeholder="Juan García"
            autoComplete="name"
            disabled={ocupado}
            className={cn(errors.nombre && 'border-red-400 focus-visible:ring-red-400')}
            {...register('nombre')}
          />
          {errors.nombre && (
            <p className="text-xs text-red-500">{errors.nombre.message}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            placeholder="+54 9 11 1234-5678"
            type="tel"
            autoComplete="tel"
            disabled={ocupado}
            className={cn(errors.whatsapp && 'border-red-400 focus-visible:ring-red-400')}
            {...register('whatsapp')}
          />
          {errors.whatsapp && (
            <p className="text-xs text-red-500">{errors.whatsapp.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            Email
          </Label>
          <Input
            id="email"
            placeholder="juan@email.com"
            type="email"
            autoComplete="email"
            inputMode="email"
            disabled={ocupado}
            className={cn(errors.email && 'border-red-400 focus-visible:ring-red-400')}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <Label htmlFor="notas" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            <span>Notas</span>
            <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span>
          </Label>
          <Input
            id="notas"
            placeholder="Alguna preferencia o indicación..."
            disabled={ocupado}
            {...register('notas')}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold mt-2"
          disabled={ocupado}
        >
          {ocupado ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            'Confirmar turno'
          )}
        </Button>
      </form>
    </div>
  )
}
