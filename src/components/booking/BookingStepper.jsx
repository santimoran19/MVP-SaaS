import { cn } from '@/lib/utils'

export function BookingStepper({ pasos, pasoActual }) {
  return (
    <div className="flex items-start gap-1">
      {pasos.map((paso, i) => (
        <div key={paso} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={cn(
              'h-1 w-full rounded-full transition-all duration-300',
              i <= pasoActual ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
            )}
          />
          <span
            className={cn(
              'text-[10px] font-medium whitespace-nowrap transition-colors duration-200',
              i === pasoActual
                ? 'text-[var(--color-primary)]'
                : i < pasoActual
                ? 'text-[var(--color-muted-foreground)]'
                : 'text-[var(--color-border)]'
            )}
          >
            {paso}
          </span>
        </div>
      ))}
    </div>
  )
}
