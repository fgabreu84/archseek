'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeleteButton from '@/components/admin/DeleteButton'
import PublishButton from '@/components/admin/PublishButton'
import { deletePlace, togglePublishPlace, batchPublishPlaces, batchDeletePlaces } from '../actions'
import type { Place } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
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

export default function PlacesList({ places }: { places: (Place & { collection?: { name: string; city: string } })[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPublishing, setIsPublishing] = useState(false)

  // Group places by city
  const placesByCity = places.reduce((acc, place) => {
    const city = place.collection?.city ?? 'Unknown'
    if (!acc[city]) {
      acc[city] = []
    }
    acc[city].push(place)
    return acc
  }, {} as Record<string, (Place & { collection?: { name: string; city: string } })[]>)

  const cities = Object.keys(placesByCity).sort()

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const handlePublishSelected = async () => {
    if (selected.size === 0) return
    setIsPublishing(true)
    try {
      await batchPublishPlaces(Array.from(selected))
      setSelected(new Set())
    } catch (err) {
      alert('Error publishing: ' + (err as Error).message)
      setIsPublishing(false)
    }
  }

  const handleExportSelected = async () => {
    if (selected.size === 0) return
    const placeIds = Array.from(selected).join(',')
    const url = `/api/admin/places/export?placeIds=${placeIds}`
    window.location.href = url
  }

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return
    const confirmed = confirm(`Delete ${selected.size} place${selected.size !== 1 ? 's' : ''}? This cannot be undone.`)
    if (!confirmed) return

    setIsPublishing(true)
    try {
      await batchDeletePlaces(Array.from(selected))
      setSelected(new Set())
    } catch (err) {
      alert('Error deleting: ' + (err as Error).message)
      setIsPublishing(false)
    }
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="sticky top-0 z-50 mb-6 p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between shadow-md">
          <span className="text-sm text-neutral-900">
            {selected.size} place{selected.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleExportSelected}
              disabled={isPublishing}
              className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              ⬇ Export CSV
            </button>
            <button
              onClick={handlePublishSelected}
              disabled={isPublishing}
              className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {isPublishing ? 'Publishing...' : '✓ Publish'}
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={isPublishing}
              className="bg-red-600 text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {cities.map((city) => (
          <div key={city}>
            <h3 className="text-xs tracking-widest uppercase text-neutral-400 mb-3 px-5">
              {city}
            </h3>
            <div className="border border-neutral-200 divide-y divide-neutral-100">
              {placesByCity[city].map((place: Place & { collection?: { name: string; city: string } }) => (
                <div key={place.id} className="flex items-center gap-4 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(place.id)}
                    onChange={() => toggleSelect(place.id)}
                    className="accent-neutral-900 cursor-pointer w-5 h-5"
                  />
                  {place.cover_image_url && (
                    <img src={place.cover_image_url} alt={place.name} className="w-12 h-12 object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-neutral-900">{place.name}</span>
                      <span className="text-xs text-neutral-400">{CATEGORY_LABELS[place.category]}</span>
                      {place.is_published ? (
                        <span className="text-xs text-neutral-400 border border-neutral-200 px-1.5 py-0.5 tracking-wide">published</span>
                      ) : (
                        <span className="text-xs text-neutral-300 border border-neutral-100 px-1.5 py-0.5 tracking-wide">draft</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {place.collection?.name ?? '—'} · {place.architect ?? 'Unknown architect'}
                      {place.year_built ? ` · ${place.year_built}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <PublishButton
                      action={togglePublishPlace.bind(null, place.id)}
                      isPublished={place.is_published}
                    />
                    <Link href={`/admin/places/${place.id}/edit`} className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                      Edit
                    </Link>
                    <DeleteButton
                      action={deletePlace.bind(null, place.id)}
                      label={place.name}
                      className="text-xs text-neutral-300 hover:text-red-500 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
