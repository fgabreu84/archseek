'use client'

interface PublishButtonProps {
  action: () => Promise<void>
  isPublished: boolean
  className?: string
}

export default function PublishButton({ action, isPublished, className }: PublishButtonProps) {
  return (
    <form action={action}>
      <button type="submit" className={`text-sm py-1.5 px-3 rounded border transition-colors ${className} ${isPublished ? 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200' : 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50'}`}>
        {isPublished ? '✓ Published' : '○ Draft'}
      </button>
    </form>
  )
}
