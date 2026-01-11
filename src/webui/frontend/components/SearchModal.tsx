import React, { useState, useEffect, useCallback } from "react"

interface SearchResult {
  qualifiedName: string
  displayName?: string
  description?: string
  useCount: number
  verified: boolean
}

interface SearchModalProps {
  selectedClient: string
  onClose: () => void
  onInstallComplete: () => void
}

export default function SearchModal({ selectedClient, onClose, onInstallComplete }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [installing, setInstalling] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/servers/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (res.ok) {
        setResults(data.servers || [])
      } else {
        setError(data.error || "Search failed")
      }
    } catch (err) {
      setError("Search failed")
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch()
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, handleSearch])

  const handleInstall = async (qualifiedName: string) => {
    setInstalling(qualifiedName)
    setError(null)

    try {
      const res = await fetch(`/api/clients/${selectedClient}/servers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualifiedName }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        onInstallComplete()
      } else if (data.command) {
        // Command-based client - show instructions
        alert(`To install this server, run:\n\n${data.command}`)
      } else {
        setError(data.error || "Installation failed")
      }
    } catch (err) {
      setError("Installation failed")
    } finally {
      setInstalling(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search MCP servers..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          )}

          {error && (
            <div className="px-6 py-4 text-red-400 text-sm">{error}</div>
          )}

          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <div className="px-6 py-8 text-center text-gray-400">
              No servers found for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="divide-y divide-gray-700">
              {results.map((server) => (
                <li key={server.qualifiedName} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">
                          {server.displayName || server.qualifiedName}
                        </h3>
                        {server.verified && (
                          <span className="text-blue-400" title="Verified">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {server.qualifiedName}
                      </p>
                      {server.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {server.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>{server.useCount.toLocaleString()} installs</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInstall(server.qualifiedName)}
                      disabled={installing === server.qualifiedName}
                      className="flex-shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {installing === server.qualifiedName ? "Installing..." : "Install"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.length < 2 && (
            <div className="px-6 py-8 text-center text-gray-400">
              <p>Type at least 2 characters to search</p>
              <p className="mt-2 text-sm">
                Examples: "github", "slack", "filesystem"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
