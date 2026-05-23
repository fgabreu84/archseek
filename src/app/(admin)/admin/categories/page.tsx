import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { createCategory, deleteCategory } from '../actions'
import type { Category } from '@/types'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')
    .order('label')

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-sm font-medium tracking-wide text-neutral-900">
          Categories
          <span className="ml-2 text-neutral-400 font-normal">{categories?.length ?? 0}</span>
        </h1>
      </div>

      {/* List */}
      <div className="border border-neutral-200 mb-8">
        {categories?.length === 0 && (
          <p className="px-4 py-6 text-sm text-neutral-400 text-center">No categories yet.</p>
        )}
        {categories?.map((cat: Category) => (
          <div key={cat.slug} className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 last:border-0">
            <div>
              <span className="text-sm text-neutral-900">{cat.label}</span>
              <span className="ml-3 text-xs text-neutral-400 font-mono">{cat.slug}</span>
            </div>
            <form action={deleteCategory.bind(null, cat.slug)}>
              <button
                type="submit"
                className="text-xs text-neutral-300 hover:text-red-400 transition-colors"
                title="Delete category"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Create form */}
      <section>
        <h2 className="text-xs tracking-widest uppercase text-neutral-400 mb-4">New Category</h2>
        <form action={createCategory} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">Label</label>
            <input
              type="text"
              name="label"
              required
              placeholder="e.g. Education"
              className="w-full bg-transparent border-b border-neutral-300 pb-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-neutral-700 transition-colors flex-shrink-0"
          >
            Add
          </button>
        </form>
        <p className="text-xs text-neutral-400 mt-2">
          The slug is auto-generated from the label (e.g. "Art Installation" → <code className="font-mono">art_installation</code>).
        </p>
      </section>
    </div>
  )
}
