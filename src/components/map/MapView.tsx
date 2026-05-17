'use client'

import { useCallback, useRef, useState, useMemo } from 'react'
import Map, { Marker, NavigationControl, ScaleControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Place, Collection, PlaceCategory } from '@/types'
import PlacePin, { CATEGORY_COLORS } from './PlacePin'
import PlacePanel from './PlacePanel'
import PlacesView from './PlacesView'

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

interface MapViewProps {
  places: Place[]
  collections: Collection[]
  purchasedCollectionIds: string[]
  isAdmin?: boolean
}

const INITIAL_VIEW = { longitude: 0, latitude: 20, zoom: 2 }

export default function MapView({ places, collections, purchasedCollectionIds, isAdmin = false }: MapViewProps) {
  const mapRef = useRef<any>(null)

  const [viewTab, setViewTab] = useState<'map' | 'places'>('map')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all')
  const [activeCollection, setActiveCollection] = useState<string | 'all'>('all')
  const [searchQ, setSearchQ] = useState('')
  const [isLocating, setIsLocating] = useState(false)

  const availableCategories = useMemo(() => {
    const set = new Set(places.map((p) => p.category))
    return (Object.keys(CATEGORY_LABELS) as PlaceCategory[]).filter((c) => set.has(c))
  }, [places])

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const matchCol = activeCollection === 'all' || p.collection_id === activeCollection
      const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())
      return matchCat && matchCol && matchSearch
    })
  }, [places, activeCategory, activeCollection, searchQ])

  const sidebarGroups = useMemo(() => {
    const groups: Partial<Record<PlaceCategory, Place[]>> = {}
    for (const p of filteredPlaces) {
      if (!groups[p.category]) groups[p.category] = []
      groups[p.category]!.push(p)
    }
    return groups
  }, [filteredPlaces])

  const collectionPanelPlaces = useMemo(() => {
    if (activeCollection === 'all') return []
    return filteredPlaces.filter((p) => p.collection_id === activeCollection)
  }, [filteredPlaces, activeCollection])

  const selectedCollectionObj = useMemo(
    () => collections.find((c) => c.id === activeCollection),
    [collections, activeCollection]
  )

  const flyToPlace = useCallback((place: Place) => {
    mapRef.current?.flyTo({ center: [place.longitude, place.latitude], zoom: 16, duration: 900 })
  }, [])

  const handlePinClick = useCallback((place: Place) => {
    setSelectedPlace(place)
    setSidebarOpen(false)
  }, [])

  const handleClose = useCallback(() => setSelectedPlace(null), [])

  const handleSidebarPlaceClick = useCallback((place: Place) => {
    flyToPlace(place)
    setSelectedPlace(place)
    setSidebarOpen(false)
  }, [flyToPlace])

  const handleSelectPlaceFromList = useCallback((place: Place) => {
    setViewTab('map')
    setTimeout(() => {
      flyToPlace(place)
      setSelectedPlace(place)
    }, 50)
  }, [flyToPlace])

  const handleCollectionClick = useCallback((colId: string) => {
    if (activeCollection === colId) {
      setActiveCollection('all')
      return
    }
    setActiveCollection(colId)
    const pts = places.filter((p) => p.collection_id === colId)
    if (!pts.length || !mapRef.current) return
    const lngs = pts.map((p) => p.longitude)
    const lats = pts.map((p) => p.latitude)
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 80, duration: 900 }
    )
  }, [places, activeCollection])

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 13, duration: 1200 })
        setIsLocating(false)
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const chip = (active: boolean) =>
    `flex-shrink-0 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border cursor-pointer transition-colors whitespace-nowrap ${
      active
        ? 'bg-amber-400 border-amber-400 text-stone-950 font-medium'
        : 'border-stone-700 text-stone-400 hover:border-stone-500'
    }`

  return (
    <div className="flex flex-col w-full h-full bg-stone-950">

      {/* Sub-header: tabs + filters */}
      <div className="flex-shrink-0 bg-stone-950 border-b border-stone-800 z-20">
        <div className="flex items-center gap-0 px-3 pt-2">
          {(['map', 'places'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-4 py-1.5 text-[11px] tracking-widest uppercase border-b-2 transition-colors ${
                viewTab === tab
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-300'
              }`}
            >
              {tab === 'map' ? 'Mapa' : 'Places'}
            </button>
          ))}
        </div>

        {viewTab === 'map' && (
          <>
            {/* Category chips */}
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none">
              <button className={chip(activeCategory === 'all')} onClick={() => setActiveCategory('all')}>
                Tudo
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  className={`${chip(activeCategory === cat)} flex items-center gap-1.5`}
                  onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Collection chips */}
            {collections.length > 0 && (
              <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none">
                <button className={chip(activeCollection === 'all')} onClick={() => setActiveCollection('all')}>
                  Todas
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    className={chip(activeCollection === col.id)}
                    onClick={() => handleCollectionClick(col.id)}
                  >
                    {col.city}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* MAP TAB */}
        {viewTab === 'map' && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden sm:flex w-72 flex-shrink-0 flex-col bg-stone-950 border-r border-stone-800 overflow-hidden z-10">
              <div className="px-3 py-2 border-b border-stone-800">
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Buscar lugar..."
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 outline-none focus:border-stone-500"
                />
              </div>
              <div className="px-3 py-1.5 border-b border-stone-800">
                <span className="text-[9px] tracking-widest uppercase text-stone-500">
                  {filteredPlaces.length} lugar{filteredPlaces.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {(Object.keys(sidebarGroups) as PlaceCategory[]).map((cat) => (
                  <div key={cat}>
                    <div className="px-3 py-1.5 text-[9px] tracking-widest uppercase text-stone-500 border-b border-stone-800">
                      {CATEGORY_LABELS[cat]}
                    </div>
                    {sidebarGroups[cat]!.map((place) => {
                      const col = collections.find((c) => c.id === place.collection_id)
                      const isLocked = !isAdmin && !purchasedCollectionIds.includes(place.collection_id)
                      return (
                        <button
                          key={place.id}
                          onClick={() => handleSidebarPlaceClick(place)}
                          className={`w-full flex items-center gap-2 px-3 py-2 border-b border-stone-800/50 hover:bg-stone-900 transition-colors text-left ${
                            selectedPlace?.id === place.id ? 'bg-stone-900' : ''
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: isLocked ? '#6b7280' : CATEGORY_COLORS[cat] }}
                          />
                          <span className={`text-xs flex-1 truncate ${isLocked ? 'text-stone-500' : 'text-stone-300'}`}>
                            {place.name}
                          </span>
                          {col && (
                            <span className="text-[9px] text-stone-600 flex-shrink-0">
                              {col.city}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </aside>

            {/* Mobile sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-stone-900 border border-stone-700 border-l-0 rounded-r-lg w-6 h-12 flex items-center justify-center text-stone-400"
            >
              {sidebarOpen ? '‹' : '›'}
            </button>

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
              <>
                <div
                  className="sm:hidden fixed inset-0 z-20"
                  onClick={() => setSidebarOpen(false)}
                />
                <aside className="sm:hidden absolute left-0 top-0 h-full w-[55vw] max-w-xs bg-stone-950 border-r border-stone-800 flex flex-col z-30 shadow-xl">
                  <div className="px-3 py-2 border-b border-stone-800">
                    <input
                      type="text"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 outline-none"
                    />
                  </div>
                  <div className="px-3 py-1 border-b border-stone-800">
                    <span className="text-[9px] tracking-widest uppercase text-stone-500">
                      {filteredPlaces.length} lugares
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {(Object.keys(sidebarGroups) as PlaceCategory[]).map((cat) => (
                      <div key={cat}>
                        <div className="px-3 py-1.5 text-[9px] tracking-widest uppercase text-stone-500 border-b border-stone-800">
                          {CATEGORY_LABELS[cat]}
                        </div>
                        {sidebarGroups[cat]!.map((place) => {
                          const isLocked = !isAdmin && !purchasedCollectionIds.includes(place.collection_id)
                          return (
                            <button
                              key={place.id}
                              onClick={() => handleSidebarPlaceClick(place)}
                              className="w-full flex items-center gap-2 px-3 py-2 border-b border-stone-800/50 hover:bg-stone-900 transition-colors text-left"
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: isLocked ? '#6b7280' : CATEGORY_COLORS[cat] }}
                              />
                              <span className={`text-xs truncate ${isLocked ? 'text-stone-500' : 'text-stone-300'}`}>
                                {place.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </aside>
              </>
            )}

            {/* Map area */}
            <div className="relative flex-1">
              <Map
                ref={mapRef}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                initialViewState={INITIAL_VIEW}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
              >
                <NavigationControl position="top-right" />
                <ScaleControl position="bottom-left" />

                {filteredPlaces.map((place) => (
                  <Marker
                    key={place.id}
                    longitude={place.longitude}
                    latitude={place.latitude}
                    anchor="center"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation()
                      handlePinClick(place)
                    }}
                  >
                    <PlacePin
                      category={place.category}
                      isSelected={selectedPlace?.id === place.id}
                      isLocked={!isAdmin && !purchasedCollectionIds.includes(place.collection_id)}
                    />
                  </Marker>
                ))}
              </Map>

              {/* Geolocation */}
              <button
                onClick={handleGeolocate}
                disabled={isLocating}
                title="Minha localização"
                className="absolute bottom-20 right-3 z-10 bg-white border border-neutral-300 rounded p-2 hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow"
              >
                <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <circle cx="12" cy="12" r="7" />
                  <path d="M12 2v2m0 16v2M22 12h-2M4 12H2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Legend */}
              {availableCategories.length > 0 && (
                <div className="absolute top-12 right-3 z-10 bg-white/95 border border-neutral-200 rounded shadow-md px-3 py-2">
                  <div className="text-[9px] tracking-widest uppercase text-neutral-400 mb-1.5">Categorias</div>
                  {availableCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-1.5 py-0.5 text-[10px] text-neutral-700">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                      {CATEGORY_LABELS[cat]}
                    </div>
                  ))}
                </div>
              )}

              {/* Collection panel */}
              {activeCollection !== 'all' && selectedCollectionObj && (
                <div className="absolute bottom-4 right-3 z-10 bg-white/95 border border-neutral-200 rounded shadow-lg p-3 min-w-[200px] max-w-[260px] max-h-60 flex flex-col">
                  <div className="text-[9px] tracking-widest uppercase text-neutral-400 mb-0.5">
                    {selectedCollectionObj.city}, {selectedCollectionObj.country}
                  </div>
                  <div className="text-[10px] font-medium text-neutral-600 mb-2">
                    {collectionPanelPlaces.length} lugar{collectionPanelPlaces.length !== 1 ? 'es' : ''}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-0.5">
                    {collectionPanelPlaces.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSidebarPlaceClick(p)}
                        className="w-full flex items-center gap-2 py-0.5 text-left group"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: CATEGORY_COLORS[p.category] }}
                        />
                        <span className="text-[10px] text-neutral-600 group-hover:text-neutral-900 truncate transition-colors">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* PLACES TAB */}
        {viewTab === 'places' && (
          <div className="flex-1 overflow-hidden">
            <PlacesView
              places={places}
              collections={collections}
              purchasedCollectionIds={purchasedCollectionIds}
              isAdmin={isAdmin}
              onSelectPlace={handleSelectPlaceFromList}
            />
          </div>
        )}
      </div>

      {/* Place detail panel */}
      {selectedPlace && viewTab === 'map' && (
        <PlacePanel
          place={selectedPlace}
          isLocked={!isAdmin && !purchasedCollectionIds.includes(selectedPlace.collection_id)}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
