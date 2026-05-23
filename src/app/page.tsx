import Link from 'next/link'
import { Josefin_Sans } from 'next/font/google'

const josefin = Josefin_Sans({ subsets: ['latin'], weight: ['100'] })

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-12">
          <span
            className={josefin.className}
            style={{ fontSize: '42px', fontWeight: 120, letterSpacing: '0.4em', textTransform: 'uppercase' }}
          >
            ARCHSEEK
          </span>
        </div>

        <div className="flex flex-col gap-3">
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
  )
}
