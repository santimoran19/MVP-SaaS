import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error('Credenciales incorrectas', { description: 'Revisá el email y la contraseña.' })
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-md">
              <Scissors className="h-7 w-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Panel Admin</h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Ingresá tus credenciales para continuar
            </p>
          </div>
        </div>

        {/* Card de login */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@tulocal.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar al panel'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--color-muted-foreground)]">
          ¿Querés hacer una reserva?{' '}
          <a href="/" className="text-[var(--color-primary)] font-medium hover:underline">
            Ir al inicio
          </a>
        </p>
      </div>
    </div>
  )
}
