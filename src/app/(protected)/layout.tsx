import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const IS_DEMO = !SUPABASE_URL.includes('.supabase.co') || SUPABASE_URL.includes('SEU_PROJETO')

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  let isAdmin = false

  if (!IS_DEMO) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.role === 'admin'
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white sticky top-0 z-50">
        <Link href="/map" className="text-sm font-medium tracking-widest uppercase">
          ARCHSEEK
        </Link>
        <nav className="flex items-center gap-6 text-xs tracking-widest uppercase text-neutral-400">
          <Link href="/collections" className="hover:text-neutral-900 transition-colors">
            Collections
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-neutral-900 transition-colors">
              Admin
            </Link>
          )}
          {!IS_DEMO && (
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="hover:text-neutral-900 transition-colors">
                Sign Out
              </button>
            </form>
          )}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
