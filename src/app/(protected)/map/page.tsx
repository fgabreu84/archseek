import { createClient } from '@/lib/supabase/server'
import MapView from '@/components/map/MapView'
import { MOCK_PLACES, MOCK_COLLECTIONS } from '@/lib/mock-places'
import type { Place, Collection } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const IS_DEMO = !SUPABASE_URL.includes('.supabase.co') || SUPABASE_URL.includes('SEU_PROJETO')

export default async function MapPage() {
  let places: Place[] = []
  let collections: Collection[] = []
  let purchasedIds: string[] = []
  let isAdmin = false

  if (IS_DEMO) {
    places = MOCK_PLACES
    collections = MOCK_COLLECTIONS
    purchasedIds = ['col-sp', 'col-csh']
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single()

    isAdmin = profile?.role === 'admin'

    const [{ data: placesData }, { data: purchases }, { data: collectionsData }] = await Promise.all([
      supabase
        .from('places')
        .select(`
          *,
          collection:collections(id, city, country),
          facts:place_facts(id, content, order_index),
          images:place_images(id, url, caption, order_index)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false }),

      isAdmin
        ? Promise.resolve({ data: [] })
        : supabase
            .from('user_purchases')
            .select('collection_id')
            .eq('user_id', user!.id),

      supabase
        .from('collections')
        .select('*')
        .eq('is_published', true),
    ])

    const allPlaces = (placesData ?? []) as Place[]
    purchasedIds = isAdmin ? [] : (purchases ?? []).map((p: { collection_id: string }) => p.collection_id)
    // Places with no collection are public (visible to all)
    places = isAdmin ? allPlaces : allPlaces.filter((p) => !p.collection_id || purchasedIds.includes(p.collection_id))

    const allCollections = (collectionsData ?? []) as Collection[]
    collections = isAdmin
      ? allCollections.sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city))
      : allCollections
          .filter((c) => purchasedIds.includes(c.id))
          .sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city))
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full relative flex flex-col">
      <MapView
        places={places}
        collections={collections}
        purchasedCollectionIds={purchasedIds}
        isAdmin={isAdmin}
      />

      {IS_DEMO && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-400/90 text-stone-950 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm z-30 pointer-events-none">
          Demo mode — configure Supabase for real data
        </div>
      )}
    </div>
  )
}
