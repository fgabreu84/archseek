import { Josefin_Sans } from 'next/font/google'

const josefin = Josefin_Sans({ subsets: ['latin'], weight: ['100'] })

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span
            className={josefin.className}
            style={{ fontSize: '42px', letterSpacing: '0.4em', textTransform: 'uppercase', whiteSpace: 'nowrap', marginRight: '-0.4em' }}
          >
            ARCHSEEK
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
