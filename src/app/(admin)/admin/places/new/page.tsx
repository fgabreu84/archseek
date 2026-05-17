import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { createPlace } from '../../actions'
import type { Collection } from '@/types'

const CATEGORIES = [
  { value: 'art_installation', label: 'Art Installation' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'landmark', label: 'Landmark' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'museum', label: 'Museum' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other' },
  { value: 'public', label: 'Public' },
  { value: 'religious', label: 'Religious' },
  { value: 'residential', label: 'Residential' },
]

export default async function NewPlacePage() {
  const supabase = await createClient()
  const { data: collections } = await supabase.from('collections').select('id, name, city').order('city')

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/places" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors tracking-widest uppercase">
          ← Places
        </Link>
        <span className="text-neutral-200">/</span>
        <span className="text-xs tracking-widest uppercase text-neutral-900">New Place</span>
      </div>

      <form action={createPlace} className="space-y-6">
        <div>
          <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Collection</label>
          <select
            name="collection_id"
            required
            className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
          >
            <option value="">Select a collection</option>
            {collections?.map(col => (
              <option key={col.id} value={col.id}>{col.name ?? col.city}</option>
            ))}
          </select>
          {!collections?.length && (
            <p className="text-xs text-neutral-400 mt-1">
              <Link href="/admin/collections/new" className="underline">Create a collection</Link> before adding places.
            </p>
          )}
        </div>

        <Field label="Place Name" name="name" required placeholder="MASP" />

        <div>
          <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Category</label>
          <select
            name="category"
            required
            className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Architect" name="architect" placeholder="Lina Bo Bardi" />
          <Field label="Year Built" name="year_built" type="number" min="1" max="2100" placeholder="1968" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude" name="latitude" type="number" step="any" required placeholder="-23.5614" />
          <Field label="Longitude" name="longitude" type="number" step="any" required placeholder="-46.6565" />
        </div>
        <p className="text-xs text-neutral-300 -mt-3">
          On Google Maps, right-click the location and copy the coordinates.
        </p>

        <div>
          <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Architectural work description..."
            className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Cover Image</label>
          <input
            type="file"
            name="cover_file"
            accept="image/*"
            className="w-full text-sm text-neutral-400 file:mr-3 file:bg-white file:border file:border-neutral-300 file:text-neutral-600 file:text-xs file:px-3 file:py-1.5 file:cursor-pointer hover:file:border-neutral-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="is_published" id="is_published" className="accent-neutral-900" />
          <label htmlFor="is_published" className="text-sm text-neutral-600">Publish immediately</label>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-neutral-700 transition-colors"
          >
            Create Place
          </button>
          <Link href="/admin/places" className="text-xs tracking-widest uppercase text-neutral-400 hover:text-neutral-900 transition-colors px-5 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', required, placeholder, step, min, max }: {
  label: string; name: string; type?: string; required?: boolean
  placeholder?: string; step?: string; min?: string; max?: string
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">{label}</label>
      <input
        type={type} name={name} required={required} placeholder={placeholder} step={step} min={min} max={max}
        className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
      />
    </div>
  )
}
