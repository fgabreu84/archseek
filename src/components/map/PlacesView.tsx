'use client'

import { useState, useMemo } from 'react'
import type { Place, Collection } from '@/types'
import { getCategoryColor } from './PlacePin'

interface PlacesViewProps {
  places: Place[]
  collections: Collection[]
  purchasedCollectionIds: string[]
  isAdmin: boolean
  onSelectPlace: (place: Place) => void
  categoryLabels: Record<string, string>
}

export default function PlacesView({
  places,
  collections,
  purchasedCollectionIds,
  isAdmin,
  onSelectPlace,
  categoryLabels,
}: PlacesViewProps) {
  const [searchQ, setSearchQ] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all')
  const [activeCollection, setActiveCollection] = useState<string | 'all'>('all')

  const filtered = useMemo(() => {
    return places.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const matchCol = activeCollection === 'all' || p.collection_id === activeCollection
      const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())
      return matchCat && matchCol && matchSearch
    })
  }, [places, activeCategory, activeCollection, searchQ])

  const grouped = useMemo(() => {
    const cats: Record<string, { collection: Collection | undefined; places: Place[] }[]> = {}

    for (const p of filtered) {
      if (!cats[p.category]) cats[p.category] = []
      const col = collections.find((c) => c.id === p.collection_id)
      let group = cats[p.category].find((g) => g.collection?.id === p.collection_id)
      if (!group) {
        group = { collection: col, places: [] }
        cats[p.category].push(group)
      }
      group.places.push(p)
    }

    // Sort categories by label, collection groups by country+city, places by name
    const catOrder = Object.keys(cats).sort(
      (a, b) => (categoryLabels[a] ?? a).localeCompare(categoryLabels[b] ?? b)
    )
    for (const cat of catOrder) {
      cats[cat].sort((a, b) => {
        const ac = a.collection, bc = b.collection
        if (!ac && !bc) return 0
        if (!ac) return -1
        if (!bc) return 1
        return ac.country.localeCompare(bc.country) || ac.city.localeCompare(bc.city)
      })
      for (const group of cats[cat]) {
        group.places.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    return { cats, catOrder }
  }, [filtered, collections, categoryLabels])

  const availableCategories = useMemo(() => {
    return Array.from(new Set(places.map((p) => p.category)))
      .sort((a, b) => (categoryLabels[a] ?? a).localeCompare(categoryLabels[b] ?? b))
  }, [places, categoryLabels])

  const chip = (active: boolean) =>
    `flex-shrink-0 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border cursor-pointer transition-colors whitespace-nowrap ${
      active
        ? 'bg-stone-500 border-stone-500 text-white font-medium'
        : 'border-stone-300 text-stone-500 hover:border-stone-400'
    }`

  return (
    <div className="flex flex-col h-full overflow-hidden bg-stone-100">
      {/* Sticky header */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-stone-100">
        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search places..."
            className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-xs text-stone-700 placeholder-stone-400 outline-none focus:border-stone-400"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none">
          <button className={chip(activeCategory === 'all')} onClick={() => setActiveCategory('all')}>
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              className={`${chip(activeCategory === cat)} flex items-center gap-1.5`}
              onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: getCategoryColor(cat) }}
              />
              {categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Collection filter */}
        {collections.length > 0 && (
          <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto scrollbar-none">
            <button className={chip(activeCollection === 'all')} onClick={() => setActiveCollection('all')}>
              All
            </button>
            {[...collections]
              .sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city))
              .map((col) => (
                <button
                  key={col.id}
                  className={chip(activeCollection === col.id)}
                  onClick={() => setActiveCollection(activeCollection === col.id ? 'all' : col.id)}
                >
                  {col.city}
                </button>
              ))}
          </div>
        )}

        {/* Stats */}
        <div className="px-3 pb-2 text-[9px] tracking-widest uppercase text-stone-400">
          {filtered.length} place{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {grouped.catOrder.length === 0 ? (
          <p className="text-stone-400 text-xs text-center py-12">No places found</p>
        ) : (
          grouped.catOrder.map((cat) => {
            const groups = grouped.cats[cat]
            const total = groups.reduce((s, g) => s + g.places.length, 0)
            return (
              <div key={cat} className="mb-4">
                {/* Category header */}
                <div className="sticky top-0 flex items-center gap-2 px-3 py-2 bg-stone-100 border-b border-stone-200 z-10">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: getCategoryColor(cat) }}
                  />
                  <span className="text-[10px] tracking-widest uppercase text-stone-600 flex-1">
                    {categoryLabels[cat] ?? cat}
                  </span>
                  <span className="text-[9px] text-stone-400">{total}</span>
                </div>

                {/* Sub-groups by collection */}
                {groups.map((group, gi) => (
                  <div key={gi}>
                    {group.collection && (
                      <div className="px-3 py-1 text-[9px] tracking-widest uppercase text-stone-400 border-b border-stone-100">
                        {group.collection.city}, {group.collection.country}
                      </div>
                    )}
                    {group.places.map((place) => {
                      const isLocked =
                        !isAdmin && !!place.collection_id && !purchasedCollectionIds.includes(place.collection_id)
                      return (
                        <button
                          key={place.id}
                          onClick={() => onSelectPlace(place)}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: isLocked ? '#d1d5db' : getCategoryColor(cat) }}
                            />
                            <span
                              className={`text-xs truncate ${isLocked ? 'text-stone-400' : 'text-stone-700'}`}
                            >
                              {place.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {place.year_built && (
                              <span className="text-[9px] text-stone-400">{place.year_built}</span>
                            )}
                            {isLocked && (
                              <svg
                                className="w-3 h-3 text-stone-300"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
