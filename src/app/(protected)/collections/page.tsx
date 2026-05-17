import { createClient } from '@/lib/supabase/server'
import type { Collection } from '@/types'
import CollectionCard from './collection-card'

export const revalidate = 0

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all published collections
  const { data: collectionsData } = await supabase
    .from('collections')
    .select('*')
    .eq('is_published', true)

  // Sort by country, then by name
  const collections = collectionsData?.sort((a, b) => {
    const countryCompare = a.country.localeCompare(b.country)
    if (countryCompare !== 0) return countryCompare
    return a.name.localeCompare(b.name)
  }) ?? []

  // Fetch user's purchases
  const { data: purchases } = await supabase
    .from('user_purchases')
    .select('collection_id')
    .eq('user_id', user.id)

  const purchasedIds = new Set(purchases?.map(p => p.collection_id) ?? [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-light text-neutral-900 mb-2">Collections</h1>
          <p className="text-neutral-600">Explore architectural treasures from around the world.</p>
        </div>

        {!collections || collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No collections available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection: Collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                isPurchased={purchasedIds.has(collection.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
