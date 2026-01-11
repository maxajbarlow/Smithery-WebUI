import React from "react"

interface Server {
  name: string
  command?: string
  args?: string[]
  type?: string
  url?: string
}

interface ServerCardProps {
  server: Server
  onUninstall: (serverName: string) => void
}

export default function ServerCard({ server, onUninstall }: ServerCardProps) {
  const isHttp = server.type === "http" || server.type === "streamableHttp"

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isHttp ? "🌐" : "📦"}</span>
          <h3 className="font-medium text-white truncate" title={server.name}>
            {server.name}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            isHttp ? "bg-blue-900/50 text-blue-400" : "bg-green-900/50 text-green-400"
          }`}
        >
          {isHttp ? "HTTP" : "STDIO"}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {isHttp && server.url && (
          <div className="text-gray-400 truncate" title={server.url}>
            <span className="text-gray-500">URL:</span> {server.url}
          </div>
        )}
        {!isHttp && server.command && (
          <div className="text-gray-400 truncate" title={server.command}>
            <span className="text-gray-500">Cmd:</span> {server.command}
          </div>
        )}
        {!isHttp && server.args && server.args.length > 0 && (
          <div className="text-gray-400 truncate" title={server.args.join(" ")}>
            <span className="text-gray-500">Args:</span> {server.args.join(" ")}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700 flex justify-end">
        <button
          onClick={() => onUninstall(server.name)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Uninstall
        </button>
      </div>
    </div>
  )
}
