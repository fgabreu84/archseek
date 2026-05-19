'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'archseek_remembered_email'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/map'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setEmail(saved)
      setRememberMe(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, email)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-sm font-medium tracking-wide text-neutral-900 mb-8">Sign In</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-neutral-900 cursor-pointer"
          />
          <label htmlFor="remember" className="text-xs text-neutral-500 cursor-pointer select-none">
            Remember my email
          </label>
        </div>

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white text-xs tracking-widest uppercase py-3 hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center space-y-3 text-xs tracking-wide text-neutral-400">
        <p>
          Don't have an account?{' '}
          <Link href="/register" className="text-neutral-900 hover:underline">
            Create Account
          </Link>
        </p>
        <p>
          <Link href="/reset-password" className="hover:text-neutral-900 transition-colors">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
