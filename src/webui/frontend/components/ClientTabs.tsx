import React from "react"

interface Client {
  name: string
  label: string
  installType: string
  supportedTransports: string[]
}

interface ClientTabsProps {
  clients: Client[]
  selectedClient: string
  onClientChange: (client: string) => void
}

const clientIcons: Record<string, string> = {
  "claude": "🖥️",
  "claude-code": "💻",
  "cursor": "🖱️",
  "windsurf": "🏄",
  "cline": "📝",
  "vscode": "📘",
  "vscode-insiders": "📗",
  "librechat": "💬",
  "gemini-cli": "💎",
  "codex": "📦",
  "opencode": "🔓",
  "witsy": "🧙",
  "enconvo": "📧",
  "roocode": "🦘",
  "boltai": "⚡",
  "amazon-bedrock": "🛏️",
  "amazonq": "❓",
  "tome": "📚",
  "goose": "🪿",
}

export default function ClientTabs({ clients, selectedClient, onClientChange }: ClientTabsProps) {
  // Group clients by install type
  const fileBasedClients = clients.filter((c) => c.installType === "json" || c.installType === "yaml")
  const commandBasedClients = clients.filter((c) => c.installType === "command")

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          File-based Clients
        </h3>
        <div className="flex flex-wrap gap-2">
          {fileBasedClients.map((client) => (
            <button
              key={client.name}
              onClick={() => onClientChange(client.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedClient === client.name
                  ? "bg-orange-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span>{clientIcons[client.name] || "📦"}</span>
              {client.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Command-based Clients
          <span className="ml-2 text-gray-600 font-normal normal-case">(limited support)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {commandBasedClients.map((client) => (
            <button
              key={client.name}
              onClick={() => onClientChange(client.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedClient === client.name
                  ? "bg-orange-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span>{clientIcons[client.name] || "📦"}</span>
              {client.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
