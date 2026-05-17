'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Collection } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CollectionCardProps {
  collection: Collection
  isPurchased: boolean
}

export default function CollectionCard({ collection, isPurchased }: CollectionCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: collection.id }),
      })

      if (!response.ok) throw new Error('Checkout failed')
      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors">
      {collection.cover_image_url && (
        <div className="relative h-48 overflow-hidden bg-neutral-100">
          <img
            src={collection.cover_image_url}
            alt={collection.city}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">
            {collection.country}
          </p>
          <h2 className="text-lg font-medium text-neutral-900">
            {collection.name ?? collection.city}
          </h2>
          {collection.description && (
            <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
              {collection.description}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-neutral-100">
          {isPurchased ? (
            <>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">
                ✓ Collection Unlocked
              </p>
              <Link
                href="/map"
                className="block text-center bg-neutral-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-neutral-700 transition-colors"
              >
                View Map
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-neutral-900 mb-3">
                {formatCurrency(collection.price_brl)}
              </p>
              <button
                onClick={handleCheckout}
                disabled={isLoading || !collection.stripe_price_id}
                className="w-full bg-neutral-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Unlock Collection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
