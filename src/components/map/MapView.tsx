'use client'

import { useCallback, useRef, useState, useMemo } from 'react'
import Map, { Marker, ScaleControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Place, Collection, PlaceCategory } from '@/types'
import PlacePin, { CATEGORY_COLORS } from './PlacePin'
import PlacePanel from './PlacePanel'
import PlacesView from './PlacesView'

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  art_installation: 'Art Installation',
  bridge: 'Bridge',
  commercial: 'Commercial',
  landmark: 'Landmark',
  landscape: 'Landscape',
  museum: 'Museum',
  office: 'Office',
  other: 'Other',
  public: 'Public Space',
  religious: 'Religious',
  residential: 'Residential',
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
  const [userLocation, setUserLocation] = useState<{ longitude: number; latitude: number } | null>(null)

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
        const loc = { longitude: coords.longitude, latitude: coords.latitude }
        setUserLocation(loc)
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
        ? 'bg-stone-500 border-stone-500 text-white font-medium'
        : 'border-stone-300 text-stone-500 hover:border-stone-400'
    }`

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="px-3 py-2 border-b border-stone-200">
        <input
          type="text"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder={mobile ? 'Search...' : 'Search places...'}
          className="w-full bg-white border border-stone-300 rounded px-3 py-1.5 text-xs text-stone-700 placeholder-stone-400 outline-none focus:border-stone-400"
        />
      </div>
      <div className="px-3 py-1.5 border-b border-stone-200">
        <span className="text-[9px] tracking-widest uppercase text-stone-400">
          {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {(Object.keys(sidebarGroups) as PlaceCategory[]).map((cat) => (
          <div key={cat}>
            <div className="px-3 py-1.5 text-[9px] tracking-widest uppercase text-stone-400 border-b border-stone-200">
              {CATEGORY_LABELS[cat]}
            </div>
            {sidebarGroups[cat]!.map((place) => {
              const col = collections.find((c) => c.id === place.collection_id)
              const isLocked = !isAdmin && !purchasedCollectionIds.includes(place.collection_id)
              return (
                <button
                  key={place.id}
                  onClick={() => handleSidebarPlaceClick(place)}
                  className={`w-full flex items-center gap-2 px-3 py-2 border-b border-stone-200 hover:bg-stone-100 transition-colors text-left cursor-pointer ${
                    selectedPlace?.id === place.id ? 'bg-stone-100' : ''
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: isLocked ? '#d1d5db' : CATEGORY_COLORS[cat] }}
                  />
                  <span className={`text-xs flex-1 truncate ${isLocked ? 'text-stone-400' : 'text-stone-700'}`}>
                    {place.name}
                  </span>
                  {!mobile && col && (
                    <span className="text-[9px] text-stone-400 flex-shrink-0">
                      {col.city}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className="flex flex-col w-full h-full bg-white">

      {/* Sub-header: tabs + filters */}
      <div className="flex-shrink-0 bg-stone-100 border-b border-stone-200 z-20">
        <div className="flex items-center gap-0 px-3 pt-2">
          {(['map', 'places'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-4 py-1.5 text-[11px] tracking-widest uppercase border-b-2 transition-colors ${
                viewTab === tab
                  ? 'border-stone-700 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              {tab === 'map' ? 'Map' : 'Places'}
            </button>
          ))}
        </div>

        {viewTab === 'map' && (
          <>
            {/* Category chips */}
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none">
              <button className={chip(activeCategory === 'all')} onClick={() => setActiveCategory('all')}>
                All
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
                  All
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
            <aside className="hidden sm:flex w-72 flex-shrink-0 flex-col bg-stone-100 border-r border-stone-200 overflow-hidden z-10">
              <SidebarContent />
            </aside>

            {/* Mobile sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-stone-200 border-l-0 rounded-r-lg w-6 h-12 flex items-center justify-center text-stone-400"
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
                <aside className="sm:hidden absolute left-0 top-0 h-full w-[55vw] max-w-xs bg-stone-100 border-r border-stone-200 flex flex-col z-30 shadow-xl">
                  <SidebarContent mobile />
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
                onClick={() => setSelectedPlace(null)}
              >
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

                {/* User location dot */}
                {userLocation && (
                  <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                  </Marker>
                )}
              </Map>

              {/* Right-side controls column: legend + zoom + geolocate */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">

                {/* Legend */}
                {availableCategories.length > 0 && (
                  <div className="bg-white/95 border border-neutral-200 rounded shadow-sm px-3 py-2">
                    <div className="text-[9px] tracking-widest uppercase text-neutral-400 mb-1.5">Categories</div>
                    {availableCategories.map((cat) => (
                      <div key={cat} className="flex items-center gap-1.5 py-0.5 text-[10px] text-neutral-700">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                        {CATEGORY_LABELS[cat]}
                      </div>
                    ))}
                  </div>
                )}

                {/* Zoom controls */}
                <div className="flex flex-col shadow-sm border border-neutral-300 rounded overflow-hidden">
                  <button
                    onClick={() => mapRef.current?.zoomIn()}
                    className="w-8 h-8 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-600 text-lg border-b border-neutral-200 transition-colors leading-none"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => mapRef.current?.zoomOut()}
                    className="w-8 h-8 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-600 text-lg transition-colors leading-none"
                    title="Zoom out"
                  >
                    −
                  </button>
                </div>

                {/* Geolocation */}
                <button
                  onClick={handleGeolocate}
                  disabled={isLocating}
                  title="My location"
                  className="w-8 h-8 bg-white border border-neutral-300 rounded flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <svg className={`w-4 h-4 ${isLocating ? 'text-blue-500' : 'text-neutral-600'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                    <circle cx="12" cy="12" r="7" />
                    <path d="M12 2v2m0 16v2M22 12h-2M4 12H2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

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
