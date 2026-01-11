import React, { useState, useEffect, useCallback } from "react"
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"
import SettingsPanel from "./components/SettingsPanel"
import SearchModal from "./components/SearchModal"

interface Settings {
  hasApiKey: boolean
  apiKeyPreview: string | null
}

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("claude")
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const handleInstallComplete = () => {
    setShowSearch(false)
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        hasApiKey={settings?.hasApiKey ?? false}
        onSettingsClick={() => setShowSettings(true)}
        onSearchClick={() => setShowSearch(true)}
      />

      <main className="container mx-auto px-4 py-6">
        {!settings?.hasApiKey ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🔑</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                API Key Required
              </h2>
              <p className="text-gray-400 mb-6">
                To use Smithery WebUI, you need to configure your Smithery API key.
                Get one from{" "}
                <a
                  href="https://smithery.ai/account/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 underline"
                >
                  smithery.ai
                </a>
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                Configure API Key
              </button>
            </div>
          </div>
        ) : (
          <Dashboard
            key={refreshKey}
            selectedClient={selectedClient}
            onClientChange={setSelectedClient}
            onRefresh={handleRefresh}
          />
        )}
      </main>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onClose={() => {
            setShowSettings(false)
            fetchSettings()
          }}
        />
      )}

      {showSearch && settings?.hasApiKey && (
        <SearchModal
          selectedClient={selectedClient}
          onClose={() => setShowSearch(false)}
          onInstallComplete={handleInstallComplete}
        />
      )}
    </div>
  )
}
