'use client'

import { useState } from 'react'

export default function ExportPlacesButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/places/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `places-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Failed to export places: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="bg-white text-neutral-900 text-xs tracking-widest uppercase px-4 py-2.5 border border-neutral-300 hover:border-neutral-900 transition-colors disabled:opacity-50"
    >
      {isLoading ? '⏳ Exporting...' : '⬇ Export CSV'}
    </button>
  )
}
