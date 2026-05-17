'use client'

import type { PlaceCategory } from '@/types'

interface PlacePinProps {
  category: PlaceCategory
  isSelected: boolean
  isLocked: boolean
}

export const CATEGORY_COLORS: Record<PlaceCategory, string> = {
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
  const r = isSelected ? 7 : 5
  const size = r * 2 + 4

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: 'pointer', overflow: 'visible' }}
    >
      {isSelected && (
        <circle
          cx={r + 2}
          cy={r + 2}
          r={r + 2}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.4"
        />
      )}
      <circle
        cx={r + 2}
        cy={r + 2}
        r={r}
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
    </svg>
  )
}
