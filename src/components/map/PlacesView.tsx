'use client'

import { useState, useMemo } from 'react'
import type { Place, Collection, PlaceCategory } from '@/types'
import { CATEGORY_COLORS } from './PlacePin'

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  art_installation: 'Arte / Instalação',
  bridge: 'Pontes',
  commercial: 'Comercial',
  landmark: 'Landmark',
  landscape: 'Paisagismo',
  museum: 'Museu',
  office: 'Escritório',
  other: 'Outro',
  public: 'Espaço Público',
  religious: 'Religioso',
  residential: 'Residencial',
}

interface PlacesViewProps {
  places: Place[]
  collections: Collection[]
  purchasedCollectionIds: string[]
  isAdmin: boolean
  onSelectPlace: (place: Place) => void
}

export default function PlacesView({
  places,
  collections,
  purchasedCollectionIds,
  isAdmin,
  onSelectPlace,
}: PlacesViewProps) {
  const [searchQ, setSearchQ] = useState('')
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all')
  const [activeCollection, setActiveCollection] = useState<string | 'all'>('all')

  const filtered = useMemo(() => {
    return places.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const matchCol = activeCollection === 'all' || p.collection_id === activeCollection
      const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())
      return matchCat && matchCol && matchSearch
    })
  }, [places, activeCategory, activeCollection, searchQ])

  // Group by category, then by collection
  const grouped = useMemo(() => {
    const cats: Record<string, { collection: Collection | undefined; places: Place[] }[]> = {}
    const catOrder: PlaceCategory[] = []

    for (const p of filtered) {
      if (!cats[p.category]) {
        cats[p.category] = []
        catOrder.push(p.category as PlaceCategory)
      }
      const col = collections.find((c) => c.id === p.collection_id)
      const colKey = p.collection_id
      let group = cats[p.category].find((g) => g.collection?.id === colKey)
      if (!group) {
        group = { collection: col, places: [] }
        cats[p.category].push(group)
      }
      group.places.push(p)
    }

    return { cats, catOrder }
  }, [filtered, collections])

  const availableCategories = useMemo(() => {
    const set = new Set(places.map((p) => p.category))
    return (Object.keys(CATEGORY_LABELS) as PlaceCategory[]).filter((c) => set.has(c))
  }, [places])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-stone-950">
      {/* Sticky header */}
      <div className="flex-shrink-0 border-b border-stone-800 bg-stone-950">
        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Buscar lugar..."
            className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-xs text-stone-200 placeholder-stone-500 outline-none focus:border-stone-500"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border transition-colors ${
              activeCategory === 'all'
                ? 'bg-amber-400 border-amber-400 text-stone-950 font-medium'
                : 'border-stone-700 text-stone-400 hover:border-stone-500'
            }`}
          >
            Tudo
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border transition-colors ${
                activeCategory === cat
                  ? 'bg-stone-800 border-stone-600 text-stone-100'
                  : 'border-stone-700 text-stone-400 hover:border-stone-500'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: CATEGORY_COLORS[cat] }}
              />
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Collection filter */}
        {collections.length > 0 && (
          <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveCollection('all')}
              className={`flex-shrink-0 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border transition-colors ${
                activeCollection === 'all'
                  ? 'bg-amber-400 border-amber-400 text-stone-950 font-medium'
                  : 'border-stone-700 text-stone-400 hover:border-stone-500'
              }`}
            >
              Todas
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setActiveCollection(activeCollection === col.id ? 'all' : col.id)}
                className={`flex-shrink-0 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border transition-colors whitespace-nowrap ${
                  activeCollection === col.id
                    ? 'bg-stone-800 border-stone-600 text-stone-100'
                    : 'border-stone-700 text-stone-400 hover:border-stone-500'
                }`}
              >
                {col.city}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="px-3 pb-2 text-[9px] tracking-widest uppercase text-stone-500">
          {filtered.length} lugar{filtered.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {grouped.catOrder.length === 0 ? (
          <p className="text-stone-500 text-xs text-center py-12">Nenhum lugar encontrado</p>
        ) : (
          grouped.catOrder.map((cat) => {
            const groups = grouped.cats[cat]
            const total = groups.reduce((s, g) => s + g.places.length, 0)
            return (
              <div key={cat} className="mb-4">
                {/* Category header */}
                <div className="sticky top-0 flex items-center gap-2 px-3 py-2 bg-stone-900 border-b border-stone-800 z-10">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[cat] }}
                  />
                  <span className="text-[10px] tracking-widest uppercase text-stone-300 flex-1">
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-[9px] text-stone-500">{total}</span>
                </div>

                {/* Sub-groups by collection */}
                {groups.map((group, gi) => (
                  <div key={gi}>
                    {group.collection && (
                      <div className="px-3 py-1 text-[9px] tracking-widest uppercase text-stone-500 border-b border-stone-800/50">
                        {group.collection.city}, {group.collection.country}
                      </div>
                    )}
                    {group.places.map((place) => {
                      const isLocked =
                        !isAdmin && !purchasedCollectionIds.includes(place.collection_id)
                      return (
                        <button
                          key={place.id}
                          onClick={() => onSelectPlace(place)}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 border-b border-stone-800/50 hover:bg-stone-900 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: isLocked ? '#6b7280' : CATEGORY_COLORS[cat] }}
                            />
                            <span
                              className={`text-xs truncate ${isLocked ? 'text-stone-500' : 'text-stone-200'}`}
                            >
                              {place.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {place.year_built && (
                              <span className="text-[9px] text-stone-500">{place.year_built}</span>
                            )}
                            {isLocked && (
                              <svg
                                className="w-3 h-3 text-stone-600"
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
