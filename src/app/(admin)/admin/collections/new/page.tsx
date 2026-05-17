import Link from 'next/link'
import { createCollection } from '../../actions'

export default function NewCollectionPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/collections" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors tracking-widest uppercase">
          ← Collections
        </Link>
        <span className="text-neutral-200">/</span>
        <span className="text-xs tracking-widest uppercase text-neutral-900">New Collection</span>
      </div>

      <form action={createCollection} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Country" name="country" required placeholder="France" />
          <Field label="City" name="city" required placeholder="Paris" />
        </div>
        <Field label="Collection Name" name="name" required placeholder="Paris — Modern Architecture" />
        <div>
          <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Brief presentation of the collection..."
            className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
          />
        </div>
        <Field label="Price (R$)" name="price_brl" type="number" step="0.01" min="0" required placeholder="49.90" />
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
          <input type="checkbox" name="is_published" id="is_published" defaultChecked className="accent-neutral-900" />
          <label htmlFor="is_published" className="text-sm text-neutral-600">Publish immediately</label>
        </div>
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-neutral-700 transition-colors"
          >
            Create Collection
          </button>
          <Link href="/admin/collections" className="text-xs tracking-widest uppercase text-neutral-400 hover:text-neutral-900 transition-colors px-5 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', required, placeholder, step, min }: {
  label: string; name: string; type?: string; required?: boolean
  placeholder?: string; step?: string; min?: string
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">{label}</label>
      <input
        type={type} name={name} required={required} placeholder={placeholder} step={step} min={min}
        className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
      />
    </div>
  )
}
