import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-12">
          <span className="text-xs font-medium tracking-widest uppercase text-neutral-900">
            ARCHSEEK
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-medium tracking-wide text-neutral-900 mb-2">
              Discover Architecture
            </h1>
            <p className="text-sm text-neutral-400">
              Explore incredible architectural works around the world.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/register"
              className="bg-neutral-900 text-white text-xs tracking-widest uppercase px-4 py-3 hover:bg-neutral-700 transition-colors text-center"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="border border-neutral-300 text-neutral-900 text-xs tracking-widest uppercase px-4 py-3 hover:border-neutral-900 transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
