'use client'

import { useState } from 'react'
import { batchCreatePlaces } from '../../actions'

interface ParsedPlace {
  name: string
  latitude: number
  longitude: number
  description?: string
  architect?: string
  year_built?: number
}

// ── KML parser ────────────────────────────────────────────────
function parseKML(content: string): { places: ParsedPlace[]; skipped: string[] } {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(content, 'text/xml')
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) throw new Error('Invalid KML file')

  const placemarks = xmlDoc.getElementsByTagName('Placemark')
  const places: ParsedPlace[] = []
  const skipped: string[] = []

  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i]
    const nameEl = pm.getElementsByTagName('name')[0]
    const coordsEl = pm.getElementsByTagName('coordinates')[0]
    const name = nameEl?.textContent?.trim() || `Place ${i + 1}`

    if (coordsEl) {
      const [lng, lat] = (coordsEl.textContent?.trim() || '').split(',').map(Number)
      if (!isNaN(lng) && !isNaN(lat)) {
        places.push({ name, latitude: lat, longitude: lng })
        continue
      }
    }
    skipped.push(name)
  }

  return { places, skipped }
}

// ── CSV parser ────────────────────────────────────────────────
function parseCSVRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue }
    if (char === ',' && !inQuotes) { result.push(current); current = ''; continue }
    current += char
  }
  result.push(current)
  return result.map((c) => c.trim())
}

function colIdx(headers: string[], aliases: string[]): number {
  return aliases.reduce((found, a) => (found >= 0 ? found : headers.indexOf(a)), -1)
}

function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // maps/search/lat,lng
  const s = url.match(/\/search\/([-\d.]+),([-\d.]+)/)
  if (s) return { lat: parseFloat(s[1]), lng: parseFloat(s[2]) }
  // @lat,lng
  const a = url.match(/@([-\d.]+),([-\d.]+)/)
  if (a) return { lat: parseFloat(a[1]), lng: parseFloat(a[2]) }
  return null
}

function parseCSV(content: string): { places: ParsedPlace[]; skipped: string[] } {
  const lines = content.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')

  const headers = parseCSVRow(lines[0]).map((h) => h.toLowerCase())

  const nameI = colIdx(headers, ['name', 'título', 'titulo', 'title', 'place', 'local'])
  const latI  = colIdx(headers, ['latitude', 'lat', 'lat.'])
  const lngI  = colIdx(headers, ['longitude', 'lon', 'lng', 'long', 'lng.'])
  const descI = colIdx(headers, ['description', 'nota', 'notes', 'descrição', 'descricao'])
  const archI = colIdx(headers, ['architect', 'arquiteto', 'arquitecto'])
  const yearI = colIdx(headers, ['year_built', 'year', 'ano', 'built'])
  const urlI  = colIdx(headers, ['url', 'link', 'maps', 'google maps'])

  if (nameI < 0) throw new Error('Cannot find a name column. Expected: "name", "title", or "place".')
  if ((latI < 0 || lngI < 0) && urlI < 0)
    throw new Error('Cannot find coordinates. Provide "latitude"/"longitude" columns, or a "url" column with Google Maps links.')

  const places: ParsedPlace[] = []
  const skipped: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i])
    if (row.every((c) => !c)) continue

    const name = row[nameI]?.trim() || `Row ${i}`

    let lat = latI >= 0 ? parseFloat(row[latI] || '') : NaN
    let lng = lngI >= 0 ? parseFloat(row[lngI] || '') : NaN

    if ((isNaN(lat) || isNaN(lng)) && urlI >= 0) {
      const coords = extractCoordsFromUrl(row[urlI] || '')
      if (coords) { lat = coords.lat; lng = coords.lng }
    }

    if (isNaN(lat) || isNaN(lng)) {
      skipped.push(name)
      continue
    }

    places.push({
      name,
      latitude: lat,
      longitude: lng,
      description: descI >= 0 ? row[descI]?.trim() || undefined : undefined,
      architect:   archI >= 0 ? row[archI]?.trim() || undefined : undefined,
      year_built:  yearI >= 0 && row[yearI] ? parseInt(row[yearI]) || undefined : undefined,
    })
  }

  return { places, skipped }
}

// ── Component ─────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'other',            label: 'Other' },
  { value: 'art_installation', label: 'Art Installation' },
  { value: 'bridge',           label: 'Bridge' },
  { value: 'commercial',       label: 'Commercial' },
  { value: 'landmark',         label: 'Landmark' },
  { value: 'landscape',        label: 'Landscape' },
  { value: 'museum',           label: 'Museum' },
  { value: 'office',           label: 'Office' },
  { value: 'public',           label: 'Public Space' },
  { value: 'religious',        label: 'Religious' },
  { value: 'residential',      label: 'Residential' },
]

export default function ImportForm({ collections }: { collections: any[] }) {
  const [fileType, setFileType]       = useState<'kml' | 'csv'>('csv')
  const [collectionId, setCollectionId] = useState('')
  const [category, setCategory]       = useState('other')
  const [preview, setPreview]         = useState<ParsedPlace[]>([])
  const [skipped, setSkipped]         = useState<string[]>([])
  const [error, setError]             = useState('')
  const [isLoading, setIsLoading]     = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError(''); setPreview([]); setSkipped([])
    try {
      const content = await f.text()
      const { places, skipped } = fileType === 'kml' ? parseKML(content) : parseCSV(content)
      setPreview(places)
      setSkipped(skipped)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (preview.length === 0) return
    setIsLoading(true)
    try {
      await batchCreatePlaces(collectionId || null, category, preview)
    } catch (err) {
      setError((err as Error).message)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* File type tabs */}
      <div className="flex border-b border-neutral-200">
        {(['csv', 'kml'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => { setFileType(type); setPreview([]); setError(''); setSkipped([]) }}
            className={`px-5 py-2 text-[11px] tracking-widest uppercase border-b-2 transition-colors ${
              fileType === type
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CSV format hint */}
      {fileType === 'csv' && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 space-y-1">
          <p className="font-medium text-neutral-700">Required columns</p>
          <p><code className="bg-neutral-100 px-1">name</code> (or <code className="bg-neutral-100 px-1">title</code> / <code className="bg-neutral-100 px-1">place</code>)</p>
          <p>
            <code className="bg-neutral-100 px-1">latitude</code> + <code className="bg-neutral-100 px-1">longitude</code>
            {' '}— or a <code className="bg-neutral-100 px-1">url</code> column with Google Maps links that contain coordinates.
          </p>
          <p className="font-medium text-neutral-700 mt-2">Optional columns</p>
          <p><code className="bg-neutral-100 px-1">description</code>, <code className="bg-neutral-100 px-1">architect</code>, <code className="bg-neutral-100 px-1">year_built</code></p>
        </div>
      )}

      {/* Collection */}
      <div>
        <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Collection</label>
        <select
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
        >
          <option value="">No collection — visible to all users</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>{col.name ?? col.city}</option>
          ))}
        </select>
        {!collectionId && (
          <p className="text-xs text-neutral-400 mt-1">Places without a collection are public and don't require purchase.</p>
        )}
      </div>

      {/* Default category */}
      <div>
        <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Default Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">
          {fileType.toUpperCase()} File
        </label>
        <input
          type="file"
          accept={fileType === 'kml' ? '.kml' : '.csv,.txt'}
          onChange={handleFileChange}
          className="w-full text-sm text-neutral-400 file:mr-3 file:bg-white file:border file:border-neutral-300 file:text-neutral-600 file:text-xs file:px-3 file:py-1.5 file:cursor-pointer hover:file:border-neutral-900 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="border border-neutral-200">
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">{preview.length} places ready</span>
              {skipped.length > 0 && (
                <span className="text-xs text-amber-600">{skipped.length} skipped (no coordinates)</span>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100">
              {preview.map((place, idx) => (
                <div key={idx} className="px-4 py-2 flex items-center gap-3 text-xs">
                  <span className="text-neutral-700 flex-1 truncate">{place.name}</span>
                  {place.architect && <span className="text-neutral-400 flex-shrink-0">{place.architect}</span>}
                  {place.year_built && <span className="text-neutral-400 flex-shrink-0">{place.year_built}</span>}
                  <span className="text-neutral-300 flex-shrink-0 font-mono">
                    {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
            {skipped.length > 0 && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                <p className="text-xs text-amber-700 font-medium mb-1">Skipped (no coordinates found):</p>
                {skipped.map((name, i) => (
                  <p key={i} className="text-xs text-amber-600">• {name}</p>
                ))}
              </div>
            )}
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
