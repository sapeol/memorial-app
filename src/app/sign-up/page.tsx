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
import { Heart, Mail, CheckCircle2 } from 'lucide-react'

/**
 * Sign-up page for new users.
 */
export default function SignUpPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuthStore()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, name)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google.')
    }
  }

  // Success state: verification email sent
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-10 bg-card border-border shadow-sm rounded-[32px] text-center">
          <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Check your email</h1>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
            We've sent a confirmation link to <span className="text-foreground font-bold">{email}</span>.
            Please activate your account to begin.
          </p>
          <Link href="/sign-in">
            <Button variant="outline" className="border-border rounded-full w-full h-12 font-bold cursor-pointer">
              Go to Sign In
            </Button>
          </Link>
        </Card>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-foreground mb-3">Create an account</h1>
          <p className="text-muted-foreground font-medium">Start creating lasting tributes today.</p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignUp}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl font-medium"
            />
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-8 font-medium">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary font-bold hover:underline underline-offset-4 cursor-pointer">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}