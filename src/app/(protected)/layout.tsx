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
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center gap-4 px-4 sm:px-6 border-b border-neutral-200 bg-white sticky top-0 z-50 h-14 flex-shrink-0">
        <Link href="/map" className="text-sm font-medium tracking-widest uppercase flex-shrink-0">
          ARCHSEEK
        </Link>
        <nav className="flex items-center gap-5 text-xs tracking-widest uppercase text-neutral-400 overflow-x-auto scrollbar-none flex-1 h-full">
          <Link href="/collections" className="hover:text-neutral-900 transition-colors whitespace-nowrap flex-shrink-0">
            Collections
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-neutral-900 transition-colors whitespace-nowrap flex-shrink-0">
              Admin
            </Link>
          )}
          {!IS_DEMO && (
            <form action="/api/auth/signout" method="post" className="flex-shrink-0">
              <button type="submit" className="hover:text-neutral-900 transition-colors whitespace-nowrap">
                Sign Out
              </button>
            </form>
          )}
        </nav>
      </header>
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  )
}
