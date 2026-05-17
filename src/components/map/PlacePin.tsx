'use client'

import type { PlaceCategory } from '@/types'

interface PlacePinProps {
  category: PlaceCategory
  isSelected: boolean
  isLocked: boolean
}

const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  art_installation: '#d946ef',
  bridge: '#14b8a6',
  commercial: '#ef4444',
  landmark: '#f97316',
  landscape: '#84cc16',
  museum: '#a855f7',
  office: '#1e40af',
  other: '#94a3b8',
  public: '#ec4899',
  religious: '#f59e0b',
  residential: '#10b981',
}

export default function PlacePin({ category, isSelected, isLocked }: PlacePinProps) {
  const color = isLocked ? '#9ca3af' : CATEGORY_COLORS[category]
  const size = isSelected ? 16 : 12

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '50%',
        border: isSelected ? '2px solid #ffffff' : 'none',
        boxShadow: isSelected ? `0 0 0 2px ${color}` : '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    />
  )
}
