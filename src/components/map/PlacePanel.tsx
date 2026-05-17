'use client'

import Link from 'next/link'
import type { Place, PlaceCategory } from '@/types'

interface PlacePanelProps {
  place: Place
  isLocked: boolean
  onClose: () => void
}

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  art_installation: 'Art Installation',
  bridge: 'Bridge',
  commercial: 'Commercial',
  landmark: 'Landmark',
  landscape: 'Landscape',
  museum: 'Museum',
  office: 'Office',
  other: 'Other',
  public: 'Public',
  religious: 'Religious',
  residential: 'Residential',
}

export default function PlacePanel({ place, isLocked, onClose }: PlacePanelProps) {
  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-80 bg-white border-l border-neutral-200 shadow-xl flex flex-col z-10 animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100">
        <div className="flex-1 pr-3">
          <span className="text-xs text-neutral-400 uppercase tracking-widest mb-1.5 block">
            {CATEGORY_LABELS[place.category]}
            {place.collection && ` · ${place.collection.city}`}
          </span>
          <h2 className="text-base font-medium text-neutral-900 leading-snug">{place.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-300 hover:text-neutral-900 transition-colors flex-shrink-0 mt-0.5"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cover image */}
      {place.cover_image_url && (
        <div className="relative h-44 overflow-hidden">
          <img src={place.cover_image_url} alt={place.name} className="w-full h-full object-cover" />
          {isLocked && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Meta */}
        {(place.architect || place.year_built) && (
          <div className="flex gap-6">
            {place.architect && (
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-widest block mb-1">Architect</span>
                <span className="text-sm text-neutral-900">{place.architect}</span>
              </div>
            )}
            {place.year_built && (
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-widest block mb-1">Year</span>
                <span className="text-sm text-neutral-900">{place.year_built}</span>
              </div>
            )}
          </div>
        )}

        {isLocked ? (
          <div className="border border-neutral-200 p-5 text-center">
            <p className="text-xs text-neutral-400 uppercase tracking-widest mb-2">Content Locked</p>
            <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
              Unlock the{' '}
              {place.collection && <span className="text-neutral-900 font-medium">{place.collection.city}</span>}{' '}
              collection to see description, facts and photos.
            </p>
            <Link
              href="/collections"
              className="inline-block bg-neutral-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-neutral-700 transition-colors"
            >
              View Collections
            </Link>
          </div>
        ) : (
          <>
            {place.description && (
              <p className="text-sm text-neutral-600 leading-relaxed">{place.description}</p>
            )}

            {place.facts && place.facts.length > 0 && (
              <div>
                <h3 className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Facts</h3>
                <ul className="space-y-3">
                  {place.facts.map((fact) => (
                    <li key={fact.id} className="flex gap-3 text-sm text-neutral-600">
                      <span className="text-neutral-300 flex-shrink-0">—</span>
                      <span className="leading-relaxed">{fact.content}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {place.images && place.images.length > 1 && (
              <div>
                <h3 className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Gallery</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {place.images.slice(1).map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={img.caption ?? place.name}
                      className="w-full h-28 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
