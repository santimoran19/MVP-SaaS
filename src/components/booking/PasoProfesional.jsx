import { User, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PasoProfesional({ profesionales, loading, seleccionado, onSeleccionar }) {
  if (loading) {
    return (
      <div className="grid gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {profesionales.map((prof) => (
        <button
          key={prof.id}
          onClick={() => onSeleccionar(prof)}
          className={cn(
            'w-full text-left rounded-xl border-2 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-sm active:scale-[0.99]',
            seleccionado?.id === prof.id
              ? 'border-[var(--color-primary)] bg-blue-50/50'
              : 'border-[var(--color-border)] bg-white'
          )}
        >
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)]">
              <User className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--color-foreground)]">{prof.nombre}</p>
              {prof.especialidad && (
                <p className="text-sm text-[var(--color-muted-foreground)]">{prof.especialidad}</p>
              )}
            </div>
            <ChevronRight
              className={cn(
                'h-5 w-5',
                seleccionado?.id === prof.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'
              )}
            />
          </div>
        </button>
      ))}
    </div>
  )
}
