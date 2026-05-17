import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeleteButton from '@/components/admin/DeleteButton'
import { updatePlace, deletePlace, addFact, deleteFact, addPlaceImage, deletePlaceImage } from '../../../actions'
import type { Collection, PlaceFact, PlaceImage } from '@/types'

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

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: place }, { data: collections }] = await Promise.all([
    supabase.from('places').select('*, facts:place_facts(*), images:place_images(*)').eq('id', id).single(),
    supabase.from('collections').select('id, name, city').order('city'),
  ])

  if (!place) notFound()

  const facts: PlaceFact[] = (place.facts ?? []).sort((a: PlaceFact, b: PlaceFact) => a.order_index - b.order_index)
  const images: PlaceImage[] = (place.images ?? []).sort((a: PlaceImage, b: PlaceImage) => a.order_index - b.order_index)

  const updateAction = updatePlace.bind(null, id)
  const addFactAction = addFact.bind(null, id)
  const addImageAction = addPlaceImage.bind(null, id)

  return (
    <div className="max-w-2xl space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/admin/places" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors tracking-widest uppercase">
          ← Places
        </Link>
        <span className="text-neutral-200">/</span>
        <span className="text-xs tracking-widest uppercase text-neutral-900 truncate">{place.name}</span>
      </div>

      {/* ── Basic Information ─── */}
      <section>
        <h2 className="text-xs tracking-widest uppercase text-neutral-400 mb-6">Basic Information</h2>
        <form action={updateAction} className="space-y-6">
          <input type="hidden" name="current_cover" value={place.cover_image_url ?? ''} />

          <div>
            <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Collection</label>
            <select
              name="collection_id"
              required
              defaultValue={place.collection_id}
              className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
            >
              {collections?.map((col: Collection) => (
                <option key={col.id} value={col.id}>{col.name ?? col.city}</option>
              ))}
            </select>
          </div>

          <Field label="Place Name" name="name" required defaultValue={place.name} />

          <div>
            <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Category</label>
            <select
              name="category"
              required
              defaultValue={place.category}
              className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Architect" name="architect" defaultValue={place.architect ?? ''} />
            <Field label="Year" name="year_built" type="number" min="1" max="2100" defaultValue={place.year_built ? String(place.year_built) : ''} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude" name="latitude" type="number" step="any" required defaultValue={String(place.latitude)} />
            <Field label="Longitude" name="longitude" type="number" step="any" required defaultValue={String(place.longitude)} />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={place.description ?? ''}
              className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Cover Image</label>
            {place.cover_image_url && (
              <img src={place.cover_image_url} alt={place.name} className="w-32 h-20 object-cover mb-3" />
            )}
            <input
              type="file"
              name="cover_file"
              accept="image/*"
              className="w-full text-sm text-neutral-400 file:mr-3 file:bg-white file:border file:border-neutral-300 file:text-neutral-600 file:text-xs file:px-3 file:py-1.5 file:cursor-pointer hover:file:border-neutral-900 transition-colors"
            />
            <p className="text-xs text-neutral-300 mt-1">Leave empty to keep current image</p>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_published" id="is_published" defaultChecked={place.is_published} className="accent-neutral-900" />
            <label htmlFor="is_published" className="text-sm text-neutral-600">Published on map</label>
          </div>

          <button
            type="submit"
            className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-neutral-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </section>

      <hr className="border-neutral-100" />

      {/* ── Facts ─── */}
      <section>
        <h2 className="text-xs tracking-widest uppercase text-neutral-400 mb-6">Facts</h2>

        {facts.length > 0 && (
          <ul className="space-y-2 mb-4">
            {facts.map((fact: PlaceFact) => (
              <li key={fact.id} className="flex items-start gap-3 border border-neutral-100 px-4 py-3">
                <span className="text-neutral-300 mt-0.5 flex-shrink-0">—</span>
                <span className="text-sm text-neutral-600 flex-1">{fact.content}</span>
                <form action={deleteFact.bind(null, fact.id, id)}>
                  <button type="submit" className="text-xs text-neutral-300 hover:text-red-400 transition-colors flex-shrink-0">✕</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addFactAction} className="flex gap-2">
          <input
            type="text"
            name="content"
            required
            placeholder="Add fact..."
            className="flex-1 bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
          />
          <button
            type="submit"
            className="text-xs tracking-widest uppercase text-neutral-400 border-b border-neutral-300 pb-2 px-3 hover:text-neutral-900 hover:border-neutral-900 transition-colors flex-shrink-0"
          >
            Add
          </button>
        </form>
      </section>

      <hr className="border-neutral-100" />

      {/* ── Image Gallery ─── */}
      <section>
        <h2 className="text-xs tracking-widest uppercase text-neutral-400 mb-6">Image Gallery</h2>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {images.map((img: PlaceImage) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt={img.caption ?? ''} className="w-full h-28 object-cover" />
                {img.caption && <p className="text-xs text-neutral-400 truncate mt-1">{img.caption}</p>}
                <form action={deletePlaceImage.bind(null, img.id, id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="submit" className="bg-white/90 text-neutral-600 text-xs w-5 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addImageAction} className="space-y-3">
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="w-full text-sm text-neutral-400 file:mr-3 file:bg-white file:border file:border-neutral-300 file:text-neutral-600 file:text-xs file:px-3 file:py-1.5 file:cursor-pointer hover:file:border-neutral-900 transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="caption"
              placeholder="Caption (optional)"
              className="flex-1 bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            />
            <button
              type="submit"
              className="text-xs tracking-widest uppercase text-neutral-400 border-b border-neutral-300 pb-2 px-3 hover:text-neutral-900 hover:border-neutral-900 transition-colors flex-shrink-0"
            >
              Upload
            </button>
          </div>
        </form>
      </section>

      <hr className="border-neutral-100" />

      {/* ── Danger Zone ─── */}
      <section>
        <h2 className="text-xs tracking-widest uppercase text-neutral-300 mb-4">Danger Zone</h2>
        <DeleteButton
          action={deletePlace.bind(null, id)}
          label={`${place.name} permanently`}
          className="text-xs tracking-widest uppercase text-neutral-300 border border-neutral-200 px-4 py-2 hover:text-red-500 hover:border-red-200 transition-colors"
        />
      </section>
    </div>
  )
}

function Field({ label, name, type = 'text', required, defaultValue, step, min, max }: {
  label: string; name: string; type?: string; required?: boolean
  defaultValue?: string; step?: string; min?: string; max?: string
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">{label}</label>
      <input
        type={type} name={name} required={required} defaultValue={defaultValue} step={step} min={min} max={max}
        className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
      />
    </div>
  )
}
