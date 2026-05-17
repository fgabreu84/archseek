'use client'

interface DeleteButtonProps {
  action: () => Promise<void>
  label: string
  className?: string
}

export default function DeleteButton({ action, label, className }: DeleteButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={className}
        onClick={(e) => { if (!confirm(`Delete "${label}"?`)) e.preventDefault() }}
      >
        Delete
      </button>
    </form>
  )
}
