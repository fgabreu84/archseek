import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PlacesList from './places-list'
import ExportPlacesButton from '@/components/admin/ExportPlacesButton'
import type { Place } from '@/types'

export default async function AdminPlacesPage() {
  const supabase = await createClient()
  const { data: places } = await supabase
    .from('places')
    .select('*, collection:collections(name, city)')
    .order('city', { ascending: true, foreignTable: 'collection' })
    .order('name', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-sm font-medium tracking-wide text-neutral-900">Places</h1>
          <p className="text-xs text-neutral-400 mt-1">{places?.length ?? 0} places created</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPlacesButton />
          <Link
            href="/admin/places/import"
            className="bg-white text-neutral-900 text-xs tracking-widest uppercase px-4 py-2.5 border border-neutral-300 hover:border-neutral-900 transition-colors"
          >
            ⬆ Import CSV / KML
          </Link>
          <Link
            href="/admin/places/new"
            className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-neutral-700 transition-colors"
          >
            + New Place
          </Link>
        </div>
      </div>

      {!places?.length ? (
        <div className="border border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">No places yet.{' '}
            <Link href="/admin/places/new" className="text-neutral-900 underline">Create the first one</Link>
          </p>
        </div>
      ) : (
        <PlacesList places={places as (Place & { collection?: { name: string; city: string } })[]} />
      )}
    </div>
  )
}
