'use client'

import { useState } from 'react'
import { grantCollectionAccess, revokeCollectionAccess } from '../actions'

interface GrantAccessButtonProps {
  userId: string
  collectionId: string
  collectionName: string
  hasPurchase: boolean
}

export default function GrantAccessButton({
  userId,
  collectionId,
  collectionName,
  hasPurchase,
}: GrantAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (hasPurchase) {
        await revokeCollectionAccess(userId, collectionId)
      } else {
        await grantCollectionAccess(userId, collectionId)
      }
    } catch (err) {
      alert('Failed to update access')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`w-full px-3 py-2 rounded border text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-50 ${
        hasPurchase
          ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-700'
          : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
      }`}
      title={collectionName}
    >
      <div className="flex items-center justify-center gap-1">
        {hasPurchase && <span>✓</span>}
        <span className="truncate">{isLoading ? '...' : collectionName}</span>
      </div>
    </button>
  )
}
