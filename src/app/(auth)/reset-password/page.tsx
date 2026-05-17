'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-sm font-medium tracking-wide text-neutral-900 mb-3">Email Sent</h2>
        <p className="text-xs text-neutral-400 mb-6">
          If that email is registered, you'll receive a link to reset your password.
        </p>
        <Link href="/login" className="block text-xs text-neutral-900 hover:underline">
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-sm font-medium tracking-wide text-neutral-900 mb-8">Reset Password</h1>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white text-xs tracking-widest uppercase py-3 hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs tracking-wide text-neutral-400">
        <Link href="/login" className="text-neutral-900 hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  )
}
