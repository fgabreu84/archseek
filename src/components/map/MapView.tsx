'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import Map, { Marker, NavigationControl, ScaleControl, MapRef } from 'react-map-gl'
import { createClient } from '@/lib/supabase/client'
import type { Collection } from '@/types'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Place } from '@/types'
import PlacePin from './PlacePin'
import PlacePanel from './PlacePanel'

interface MapViewProps {
  places: Place[]
  purchasedCollectionIds: string[]
  isAdmin?: boolean
}

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
}

export default function MapView({ places, purchasedCollectionIds, isAdmin }: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      const supabase = createClient()
      let query = supabase
        .from('collections')
        .select('*')
        .eq('is_published', true)

      if (!isAdmin && purchasedCollectionIds.length > 0) {
        query = query.in('id', purchasedCollectionIds)
      } else if (!isAdmin) {
        setCollections([])
        return
      }

      const { data } = await query
      if (data) {
        const sorted = data.sort((a, b) => {
          const countryCompare = a.country.localeCompare(b.country)
          if (countryCompare !== 0) return countryCompare
          return a.name.localeCompare(b.name)
        })
        setCollections(sorted)
      }
    }

    fetchCollections()
  }, [purchasedCollectionIds, isAdmin])


  const handlePinClick = useCallback((place: Place) => {
    setSelectedPlace(place)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedPlace(null)
  }, [])

  const handleGeolocate = useCallback(() => {
    if (!mapRef.current) return
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 12,
          duration: 1500,
        })
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
        alert('Unable to access your location. Please enable location services.')
      }
    )
  }, [])

  const handleCollectionClick = useCallback((collection: Collection) => {
    if (!mapRef.current) return
    // Get bounds of places in this collection to zoom to all of them
    const collectionPlaces = places.filter(p => p.collection_id === collection.id)
    if (collectionPlaces.length === 0) return

    const lngs = collectionPlaces.map(p => p.longitude)
    const lats = collectionPlaces.map(p => p.latitude)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    mapRef.current.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: 120, duration: 1000 }
    )
  }, [places])

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/fgabreu/cmp8u3lq8002k01s1f4mwcaca"
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <button
          onClick={handleGeolocate}
          disabled={isLocating}
          className="absolute bottom-4 right-4 z-10 bg-white border border-neutral-300 rounded p-2 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
          title="Go to my location"
        >
          <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 2v2m0 16v2M22 12h-2M4 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id
          return (
            <Marker
              key={place.id}
              longitude={place.longitude}
              latitude={place.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                handlePinClick(place)
              }}
            >
              <div className="relative">
                <PlacePin
                  category={place.category}
                  isSelected={isSelected}
                  isLocked={!isAdmin && !purchasedCollectionIds.includes(place.collection_id)}
                />
                {isSelected && (
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white border border-neutral-200 rounded px-3 py-1.5 shadow-md">
                    <p className="text-xs font-medium text-neutral-900">{place.name}</p>
                  </div>
                )}
              </div>
            </Marker>
          )
        })}
      </Map>

      {collections.length > 0 && (
        <div className="absolute top-0 left-0 h-full w-64 bg-white border-r border-neutral-200 shadow-lg flex flex-col z-10 overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100">
            <h2 className="text-sm font-medium text-neutral-900">Collections</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleCollectionClick(collection)}
                className="w-full text-left px-6 py-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">
                  {collection.country}
                </p>
                <p className="text-sm font-medium text-neutral-900">
                  {collection.name ?? collection.city}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPlace && (
        <PlacePanel
          place={selectedPlace}
          isLocked={!isAdmin && !purchasedCollectionIds.includes(selectedPlace.collection_id)}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
