'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuthStore } from '@/lib/store/auth-store'
import { Heart } from 'lucide-react'

/**
 * Sign-in page leveraging global auth store for session management.
 */
export default function SignInPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      const redirectUrl = new URL(window.location.href).searchParams.get('redirect')
      router.push(redirectUrl || '/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md p-10 bg-card border-border shadow-sm rounded-[32px]">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group cursor-pointer">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-foreground text-2xl font-bold tracking-tight">Memorial</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-3">Welcome back</h1>
          <p className="text-muted-foreground font-medium">Sign in to access your memorials.</p>
        </div>

        {/* Third-party Auth */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-border bg-background text-foreground hover:bg-secondary transition-all mb-8 font-bold h-12 cursor-pointer shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black">
            <span className="bg-card px-4 text-muted-foreground">or email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl font-medium"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl font-medium"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 shake">
              <p className="text-destructive text-sm font-bold">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:opacity-90 h-12 rounded-full text-lg font-bold shadow-sm cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-10 font-medium">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-primary font-bold hover:underline underline-offset-4 cursor-pointer">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}