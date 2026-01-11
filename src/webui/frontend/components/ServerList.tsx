import React from "react"
import ServerCard from "./ServerCard"

interface Server {
  name: string
  command?: string
  args?: string[]
  type?: string
  url?: string
}

interface ServerListProps {
  servers: Server[]
  onUninstall: (serverName: string) => void
}

export default function ServerList({ servers, onUninstall }: ServerListProps) {
  if (servers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="text-4xl mb-3">📦</div>
        <h3 className="text-lg font-medium text-white mb-1">No servers installed</h3>
        <p className="text-gray-400">
          Click "Search Registry" to find and install MCP servers
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servers.map((server) => (
        <ServerCard key={server.name} server={server} onUninstall={onUninstall} />
      ))}
    </div>
  )
}
