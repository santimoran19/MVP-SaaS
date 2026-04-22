import { z } from 'zod'

// ─────────────────────────────────────────────
// Helpers de validación
// ─────────────────────────────────────────────

/**
 * Teléfono Argentina — acepta los formatos más comunes:
 *   +54 9 11 1234-5678   (celular BA, internacional)
 *   +54 9 351 123-4567   (celular interior)
 *   011 15 1234-5678     (celular BA, local)
 *   1112345678           (10 dígitos, sin prefijo)
 *   549 11 12345678      (sin +, con código país y 9)
 * Normalización: se eliminan espacios, guiones y paréntesis antes de validar.
 */
function validarTelefonoAR(valor) {
  const digitos = valor.replace(/[\s\-().+]/g, '')
  // Aceptamos: 549XXXXXXXXXX (13d), 54XXXXXXXXXX (12d), XXXXXXXXXXX (11d), XXXXXXXXXX (10d)
  return /^(549\d{10}|54\d{10}|\d{11}|\d{10})$/.test(digitos)
}

// ─────────────────────────────────────────────
// Schema del formulario de reserva del cliente
// (usado en PasoConfirmacion)
// ─────────────────────────────────────────────
export const bookingClienteSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(60, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'El nombre solo puede contener letras'),

  whatsapp: z
    .string()
    .min(8, 'Número demasiado corto')
    .refine(validarTelefonoAR, 'Formato inválido. Ej: +54 9 11 1234-5678'),

  email: z
    .string()
    .email('Ingresá un email válido')
    .max(100, 'El email es demasiado largo'),

  notas: z
    .string()
    .max(200, 'Las notas no pueden superar 200 caracteres')
    .optional()
    .or(z.literal('')),
})

// ─────────────────────────────────────────────
// Schema completo de turno (para uso interno/admin)
// ─────────────────────────────────────────────
export const bookingSchema = bookingClienteSchema.extend({
  servicio_id: z.string().uuid('Seleccioná un servicio'),
  profesional_id: z.string().uuid('Seleccioná un profesional'),
  fecha: z.date({ required_error: 'Seleccioná una fecha' }),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Seleccioná un horario'),
})

// ─────────────────────────────────────────────
// Schemas de administración
// ─────────────────────────────────────────────
export const servicioSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre es requerido')
    .max(80, 'Nombre demasiado largo'),
  descripcion: z.string().max(200).optional().or(z.literal('')),
  duracion_minutos: z
    .number({ invalid_type_error: 'Ingresá un número' })
    .int()
    .min(10, 'Mínimo 10 minutos')
    .max(480, 'Máximo 8 horas'),
  precio: z
    .number({ invalid_type_error: 'Ingresá un precio' })
    .min(0, 'El precio no puede ser negativo')
    .max(9_999_999, 'Precio fuera de rango'),
  activo: z.boolean().default(true),
})

export const profesionalSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre es requerido')
    .max(80),
  especialidad: z.string().max(100).optional().or(z.literal('')),
  activo: z.boolean().default(true),
})

// ─────────────────────────────────────────────
// Bloqueo de disponibilidad (horario bloqueado)
// ─────────────────────────────────────────────
export const bloqueoSchema = z
  .object({
    profesional_id: z.string().uuid('Seleccioná un profesional'),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
    hora_fin: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
    motivo: z.string().max(100).optional().or(z.literal('')),
  })
  .refine((d) => d.hora_inicio < d.hora_fin, {
    message: 'La hora de fin debe ser mayor a la de inicio',
    path: ['hora_fin'],
  })

// ─────────────────────────────────────────────
// Edición de turno (cambio de profesional/hora)
// ─────────────────────────────────────────────
export const turnoEditSchema = z.object({
  profesional_id: z.string().uuid('Seleccioná un profesional'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Seleccioná un horario'),
})
