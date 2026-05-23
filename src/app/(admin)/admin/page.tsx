import Link from 'next/link'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-sm font-medium tracking-wide text-neutral-900 mb-8">Admin Panel</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/collections"
          className="border border-neutral-200 p-6 hover:border-neutral-900 transition-colors group"
        >
          <h2 className="text-xs tracking-widest uppercase text-neutral-400 mb-2 group-hover:text-neutral-900 transition-colors">Collections</h2>
          <p className="text-sm text-neutral-600">Manage cities and regions available in the app</p>
        </Link>
        <Link
          href="/admin/places"
          className="border border-neutral-200 p-6 hover:border-neutral-900 transition-colors group"
        >
          <h2 className="text-xs tracking-widest uppercase text-neutral-400 mb-2 group-hover:text-neutral-900 transition-colors">Places</h2>
          <p className="text-sm text-neutral-600">Add and edit architectural works</p>
        </Link>
        <Link
          href="/admin/categories"
          className="border border-neutral-200 p-6 hover:border-neutral-900 transition-colors group"
        >
          <h2 className="text-xs tracking-widest uppercase text-neutral-400 mb-2 group-hover:text-neutral-900 transition-colors">Categories</h2>
          <p className="text-sm text-neutral-600">Manage place categories</p>
        </Link>
      </div>
    </div>
  )
}
