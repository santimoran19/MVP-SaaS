import { z } from 'zod'

export const bookingSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  whatsapp: z
    .string()
    .regex(/^(\+54|0)?[0-9]{10,11}$/, 'Ingresá un número de WhatsApp válido'),
  servicio_id: z.string().uuid('Seleccioná un servicio'),
  profesional_id: z.string().uuid('Seleccioná un profesional'),
  fecha: z.date({ required_error: 'Seleccioná una fecha' }),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Seleccioná un horario'),
  notas: z.string().max(200, 'Las notas no pueden superar 200 caracteres').optional(),
})

export const servicioSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido').max(80),
  descripcion: z.string().max(200).optional(),
  duracion_minutos: z
    .number()
    .int()
    .min(15, 'Mínimo 15 minutos')
    .max(480, 'Máximo 8 horas'),
  precio: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(999999),
  activo: z.boolean().default(true),
})

export const profesionalSchema = z.object({
  nombre: z.string().min(2).max(80),
  especialidad: z.string().max(100).optional(),
  activo: z.boolean().default(true),
})
