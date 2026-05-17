import { createAdminClient } from './supabase/admin'

// Define collection bundles: when a user buys a collection, they also get these
const COLLECTION_BUNDLES: Record<string, string[]> = {
  'San Francisco': ['Silicon Valley'],
}

export async function grantBundledCollections(userId: string, collectionName: string) {
  const bundledNames = COLLECTION_BUNDLES[collectionName]
  if (!bundledNames || bundledNames.length === 0) return

  const supabase = createAdminClient()

  // Fetch the IDs of bundled collections
  const { data: bundledCollections, error: fetchError } = await supabase
    .from('collections')
    .select('id')
    .in('name', bundledNames)

  if (fetchError) throw new Error(`Failed to fetch bundled collections: ${fetchError.message}`)
  if (!bundledCollections || bundledCollections.length === 0) return

  // Check which bundled collections the user already has
  const { data: existingPurchases, error: checkError } = await supabase
    .from('user_purchases')
    .select('collection_id')
    .eq('user_id', userId)
    .in('collection_id', bundledCollections.map(c => c.id))

  if (checkError) throw new Error(`Failed to check existing purchases: ${checkError.message}`)

  const existingIds = new Set(existingPurchases?.map(p => p.collection_id) || [])
  const newPurchases = bundledCollections
    .filter(c => !existingIds.has(c.id))
    .map(c => ({
      user_id: userId,
      collection_id: c.id,
    }))

  if (newPurchases.length === 0) return

  const { error: insertError } = await supabase
    .from('user_purchases')
    .insert(newPurchases)

  if (insertError) throw new Error(`Failed to grant bundled collections: ${insertError.message}`)
}
