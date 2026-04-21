import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Phone, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  whatsapp: z.string().regex(/^(\+54|0054|0)?[0-9]{10,11}$/, 'Número inválido (ej: 1155667788)'),
  notas: z.string().max(200).optional(),
})

export function PasoConfirmacion({ servicio, profesional, fecha, hora, loading, onConfirmar }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[var(--color-secondary)] p-4 space-y-2">
        <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Resumen del turno</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-[var(--color-muted-foreground)]">Servicio</span>
          <span className="font-medium">{servicio?.nombre}</span>
          <span className="text-[var(--color-muted-foreground)]">Profesional</span>
          <span className="font-medium">{profesional?.nombre}</span>
          <span className="text-[var(--color-muted-foreground)]">Fecha</span>
          <span className="font-medium capitalize">
            {fecha && format(fecha, "EEEE d 'de' MMMM", { locale: es })}
          </span>
          <span className="text-[var(--color-muted-foreground)]">Hora</span>
          <span className="font-medium">{hora} hs</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onConfirmar)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre" className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            Tu nombre
          </Label>
          <Input
            id="nombre"
            placeholder="Juan García"
            {...register('nombre')}
            className={errors.nombre ? 'border-red-400' : ''}
          />
          {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            placeholder="1155667788"
            type="tel"
            {...register('whatsapp')}
            className={errors.whatsapp ? 'border-red-400' : ''}
          />
          {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notas" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            Notas (opcional)
          </Label>
          <Input
            id="notas"
            placeholder="Alguna preferencia o indicación..."
            {...register('notas')}
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold mt-2" disabled={loading}>
          {loading ? (
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
