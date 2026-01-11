import React, { useState } from "react"

interface Settings {
  hasApiKey: boolean
  apiKeyPreview: string | null
}

interface SettingsPanelProps {
  settings: Settings | null
  onClose: () => void
}

export default function SettingsPanel({ settings, onClose }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/settings/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess("API key saved successfully!")
        setApiKey("")
        setTimeout(() => onClose(), 1500)
      } else {
        setError(data.error || "Failed to save API key")
      }
    } catch (err) {
      setError("Failed to save API key")
    } finally {
      setLoading(false)
    }
  }

  const handleClearApiKey = async () => {
    if (!confirm("Are you sure you want to clear your API key?")) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/settings/apikey", { method: "DELETE" })
      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess("API key cleared")
        setTimeout(() => onClose(), 1500)
      } else {
        setError(data.error || "Failed to clear API key")
      }
    } catch (err) {
      setError("Failed to clear API key")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Smithery API Key
            </label>

            {settings?.hasApiKey && (
              <div className="mb-4 p-3 bg-gray-900 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Current key</div>
                  <div className="font-mono text-sm text-green-400">
                    {settings.apiKeyPreview}
                  </div>
                </div>
                <button
                  onClick={handleClearApiKey}
                  disabled={loading}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Clear
                </button>
              </div>
            )}

            <form onSubmit={handleSaveApiKey}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={settings?.hasApiKey ? "Enter new API key" : "Enter your API key"}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <p className="mt-2 text-sm text-gray-400">
                Get your API key from{" "}
                <a
                  href="https://smithery.ai/account/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400"
                >
                  smithery.ai
                </a>
              </p>

              {error && (
                <div className="mt-3 text-sm text-red-400">{error}</div>
              )}
              {success && (
                <div className="mt-3 text-sm text-green-400">{success}</div>
              )}

              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="mt-4 w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Saving..." : "Save API Key"}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2">About</h3>
            <p className="text-sm text-gray-400">
              Smithery WebUI is a graphical interface for managing MCP servers
              across multiple AI clients. It wraps the Smithery CLI functionality
              in an easy-to-use web interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
