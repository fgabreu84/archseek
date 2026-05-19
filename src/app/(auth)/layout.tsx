import { Josefin_Sans } from 'next/font/google'

const josefin = Josefin_Sans({ subsets: ['latin'], weight: ['100'] })

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <span
            className={josefin.className}
            style={{ fontSize: '36px', fontWeight: 100, letterSpacing: '0.4em', textTransform: 'uppercase' }}
          >
            ARCHSEEK
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
