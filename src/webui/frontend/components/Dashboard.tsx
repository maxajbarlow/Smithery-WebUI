import React, { useState, useEffect, useCallback } from "react"
import ClientTabs from "./ClientTabs"
import ServerList from "./ServerList"

interface Client {
  name: string
  label: string
  installType: string
  supportedTransports: string[]
  path?: string
  supportsOAuth?: boolean
}

interface Server {
  name: string
  command?: string
  args?: string[]
  type?: string
  url?: string
}

interface DashboardProps {
  selectedClient: string
  onClientChange: (client: string) => void
  onRefresh: () => void
}

export default function Dashboard({ selectedClient, onClientChange, onRefresh }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientMessage, setClientMessage] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(data.clients)
    } catch (err) {
      setError("Failed to fetch clients")
    }
  }, [])

  const fetchServers = useCallback(async () => {
    setLoading(true)
    setError(null)
    setClientMessage(null)

    try {
      const res = await fetch(`/api/clients/${selectedClient}/servers`)
      const data = await res.json()

      if (data.message) {
        setClientMessage(data.message)
        setServers([])
      } else {
        setServers(data.servers || [])
      }
    } catch (err) {
      setError("Failed to fetch servers")
      setServers([])
    } finally {
      setLoading(false)
    }
  }, [selectedClient])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    if (selectedClient) {
      fetchServers()
    }
  }, [selectedClient, fetchServers])

  const handleUninstall = async (serverName: string) => {
    if (!confirm(`Are you sure you want to uninstall ${serverName}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/clients/${selectedClient}/servers/${serverName}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (data.success) {
        fetchServers()
        onRefresh()
      } else {
        alert(data.error || data.message || "Failed to uninstall")
      }
    } catch (err) {
      alert("Failed to uninstall server")
    }
  }

  const selectedClientInfo = clients.find((c) => c.name === selectedClient)

  return (
    <div>
      <ClientTabs
        clients={clients}
        selectedClient={selectedClient}
        onClientChange={onClientChange}
      />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Installed Servers
            {selectedClientInfo && (
              <span className="text-gray-400 font-normal ml-2">
                for {selectedClientInfo.label}
              </span>
            )}
          </h2>
          <button
            onClick={fetchServers}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
            {error}
          </div>
        ) : clientMessage ? (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 text-yellow-400">
            {clientMessage}
          </div>
        ) : (
          <ServerList servers={servers} onUninstall={handleUninstall} />
        )}
      </div>
    </div>
  )
}
