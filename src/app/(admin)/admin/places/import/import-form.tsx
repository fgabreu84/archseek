'use client'

import { useState } from 'react'
import { batchCreatePlaces } from '../../actions'
import type { Collection } from '@/types'

interface ParsedPlace {
  name: string
  latitude: number
  longitude: number
}

function parseKML(kmlContent: string): ParsedPlace[] {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(kmlContent, 'text/xml')

  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid KML file')
  }

  const placemarks = xmlDoc.getElementsByTagName('Placemark')
  const places: ParsedPlace[] = []

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i]
    const nameEl = placemark.getElementsByTagName('name')[0]
    const coordsEl = placemark.getElementsByTagName('coordinates')[0]

    if (nameEl && coordsEl) {
      const name = nameEl.textContent?.trim() || `Place ${i + 1}`
      const coordsText = coordsEl.textContent?.trim() || ''
      const [longitude, latitude] = coordsText.split(',').map(Number)

      if (!isNaN(longitude) && !isNaN(latitude)) {
        places.push({ name, latitude, longitude })
      }
    }
  }

  return places
}

export default function ImportForm({ collections }: { collections: Collection[] }) {
  const [collectionId, setCollectionId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedPlace[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError('')
    setFile(selectedFile)

    try {
      const content = await selectedFile.text()
      const places = parseKML(content)
      setPreview(places)
    } catch (err) {
      setError((err as Error).message)
      setPreview([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectionId || preview.length === 0) return

    setIsLoading(true)
    try {
      await batchCreatePlaces(collectionId, preview)
    } catch (err) {
      setError((err as Error).message)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Target Collection</label>
        <select
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          required
          className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
        >
          <option value="">Select a collection</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name ?? col.city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">KML File</label>
        <input
          type="file"
          accept=".kml"
          onChange={handleFileChange}
          className="w-full text-sm text-neutral-400 file:mr-3 file:bg-white file:border file:border-neutral-300 file:text-neutral-600 file:text-xs file:px-3 file:py-1.5 file:cursor-pointer hover:file:border-neutral-900 transition-colors"
        />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="p-4 bg-neutral-50 border border-neutral-200">
            <p className="text-sm text-neutral-900 font-medium mb-3">{preview.length} places found:</p>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {preview.map((place, idx) => (
                <div key={idx} className="text-xs text-neutral-600">
                  <span className="font-medium">{place.name}</span> ({place.latitude.toFixed(4)}, {place.longitude.toFixed(4)})
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Importing...' : `Import ${preview.length} places`}
          </button>
        </div>
      )}
    </form>
  )
}
