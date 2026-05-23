import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/map')

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/map" className="text-sm font-medium tracking-widest uppercase text-neutral-900">
            ARCHSEEK
          </Link>
          <span className="text-xs tracking-widest uppercase text-neutral-400 border-l border-neutral-200 pl-4">
            Admin
          </span>
        </div>
        <nav className="flex items-center gap-6 text-xs tracking-widest uppercase text-neutral-400">
          <Link href="/admin/collections" className="hover:text-neutral-900 transition-colors">
            Collections
          </Link>
          <Link href="/admin/places" className="hover:text-neutral-900 transition-colors">
            Places
          </Link>
          <Link href="/admin/categories" className="hover:text-neutral-900 transition-colors">
            Categories
          </Link>
          <Link href="/admin/users" className="hover:text-neutral-900 transition-colors">
            Users
          </Link>
          <Link href="/map" className="hover:text-neutral-900 transition-colors">
            View Map
          </Link>
        </nav>
      </header>
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  )
}
