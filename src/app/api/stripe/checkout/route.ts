import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { grantBundledCollections } from '@/lib/collection-bundles'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { collectionId } = await request.json()
    if (!collectionId) {
      return NextResponse.json({ error: 'Missing collectionId' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already purchased this collection
    const { data: existing } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('collection_id', collectionId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Collection already purchased' }, { status: 400 })
    }

    // Fetch collection
    const { data: collection, error: collError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single()

    if (collError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    if (!collection.stripe_price_id) {
      return NextResponse.json({ error: 'Collection not available for purchase' }, { status: 400 })
    }

    // TODO: Implement Stripe session creation with metadata for webhook
    // When implementing, pass these metadata:
    // metadata: {
    //   user_id: user.id,
    //   collection_id: collectionId,
    //   collection_name: collection.name,
    // }

    // For testing/admin: instant grant via admin client
    // This allows admins to manually grant collections
    if (process.env.NODE_ENV === 'development') {
      const adminSubabase = createAdminClient()
      await adminSubabase.from('user_purchases').insert({
        user_id: user.id,
        collection_id: collectionId,
      })
      await grantBundledCollections(user.id, collection.name)
      return NextResponse.json({ success: true, devMode: true })
    }

    return NextResponse.json(
      { error: 'Stripe integration not yet implemented. Please contact support.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
