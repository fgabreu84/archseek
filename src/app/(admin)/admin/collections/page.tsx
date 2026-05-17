import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteButton from '@/components/admin/DeleteButton'
import { deleteCollection } from '../actions'
import type { Collection } from '@/types'

export default async function AdminCollectionsPage() {
  const supabase = await createClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-sm font-medium tracking-wide text-neutral-900">Collections</h1>
          <p className="text-xs text-neutral-400 mt-1">{collections?.length ?? 0} collections created</p>
        </div>
        <Link
          href="/admin/collections/new"
          className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-neutral-700 transition-colors"
        >
          + New Collection
        </Link>
      </div>

      {!collections?.length ? (
        <div className="border border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">No collections yet.{' '}
            <Link href="/admin/collections/new" className="text-neutral-900 underline">Create the first one</Link>
          </p>
        </div>
      ) : (
        <div className="border border-neutral-200 divide-y divide-neutral-100">
          {collections.map((col: Collection) => (
            <div key={col.id} className="flex items-center gap-4 px-5 py-4">
              {col.cover_image_url && (
                <img src={col.cover_image_url} alt={col.name} className="w-12 h-12 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-900">{col.name}</span>
                  {col.is_published ? (
                    <span className="text-xs text-neutral-400 border border-neutral-200 px-1.5 py-0.5 tracking-wide">published</span>
                  ) : (
                    <span className="text-xs text-neutral-300 border border-neutral-100 px-1.5 py-0.5 tracking-wide">draft</span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {col.city}, {col.country} · R$ {Number(col.price_brl).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <Link href={`/admin/collections/${col.id}/edit`} className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                  Edit
                </Link>
                <DeleteButton
                  action={deleteCollection.bind(null, col.id)}
                  label={col.name}
                  className="text-xs text-neutral-300 hover:text-red-500 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
