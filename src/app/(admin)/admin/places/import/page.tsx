import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Collection } from '@/types'
import ImportForm from './import-form'

export default async function ImportPlacesPage() {
  const supabase = await createClient()
  const [{ data: collections }, { data: categories }] = await Promise.all([
    supabase.from('collections').select('id, name, city').order('city'),
    supabase.from('categories').select('slug, label').order('label'),
  ])

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/places" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors tracking-widest uppercase">
          ← Places
        </Link>
        <span className="text-neutral-200">/</span>
        <span className="text-xs tracking-widest uppercase text-neutral-900">Import CSV / KML</span>
      </div>

      <ImportForm collections={collections || []} categories={categories || []} />
    </div>
  )
}
