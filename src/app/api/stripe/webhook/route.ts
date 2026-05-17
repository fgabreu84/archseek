import { createAdminClient } from '@/lib/supabase/admin'
import { grantBundledCollections } from '@/lib/collection-bundles'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // TODO: Verify Stripe signature (requires STRIPE_WEBHOOK_SECRET)
    // For now, just parse the event
    const event = JSON.parse(body)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const userId = paymentIntent.metadata?.user_id
      const collectionId = paymentIntent.metadata?.collection_id
      const collectionName = paymentIntent.metadata?.collection_name

      if (!userId || !collectionId || !collectionName) {
        return NextResponse.json(
          { error: 'Missing metadata in payment intent' },
          { status: 400 }
        )
      }

      const supabase = createAdminClient()

      // Check if purchase already exists
      const { data: existing } = await supabase
        .from('user_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('collection_id', collectionId)
        .single()

      if (!existing) {
        // Create purchase record
        const { error: purchaseError } = await supabase
          .from('user_purchases')
          .insert({
            user_id: userId,
            collection_id: collectionId,
          })

        if (purchaseError) {
          console.error('Failed to create purchase:', purchaseError)
          return NextResponse.json(
            { error: 'Failed to record purchase' },
            { status: 500 }
          )
        }
      }

      // Grant bundled collections
      try {
        await grantBundledCollections(userId, collectionName)
      } catch (bundleError) {
        console.error('Failed to grant bundled collections:', bundleError)
        // Don't fail the webhook for bundle errors
      }

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
