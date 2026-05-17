export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-xs font-medium tracking-widest uppercase text-neutral-900">
            ARCHSEEK
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
