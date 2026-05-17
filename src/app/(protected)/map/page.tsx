import { createClient } from '@/lib/supabase/server'
import MapView from '@/components/map/MapView'
import { MOCK_PLACES } from '@/lib/mock-places'
import type { Place } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const IS_DEMO = !SUPABASE_URL.includes('.supabase.co') || SUPABASE_URL.includes('SEU_PROJETO')

export default async function MapPage() {
  let places: Place[] = []
  let purchasedIds: string[] = []
  let isAdmin = false

  if (IS_DEMO) {
    places = MOCK_PLACES
    // In demo: treat São Paulo (free) as purchased
    purchasedIds = ['col-sp']
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single()

    isAdmin = profile?.role === 'admin'

    const [{ data: placesData }, { data: purchases }] = await Promise.all([
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
    ])

    let allPlaces = (placesData ?? []) as Place[]

    if (isAdmin) {
      // Admin sees all places
      places = allPlaces
      purchasedIds = [] // All places are accessible for admin (no locks)
    } else {
      // Regular user only sees places from purchased collections
      purchasedIds = (purchases ?? []).map((p) => p.collection_id)
      places = allPlaces.filter((place) => purchasedIds.includes(place.collection_id))
    }
  }

  return (
    <div className="h-[calc(100vh-57px)] w-full relative">
      <MapView places={places} purchasedCollectionIds={purchasedIds} isAdmin={isAdmin} />

      {IS_DEMO && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-400/90 text-stone-950 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
          Modo demo — configure o Supabase para dados reais
        </div>
      )}
    </div>
  )
}
