import { Router, type Request, type Response } from "express"
import { resolveServer, searchServers } from "../../lib/registry.js"
import { getApiKey } from "../../utils/smithery-settings.js"

export const serversRouter = Router()

/**
 * GET /api/servers/search?q=term
 * Search the Smithery registry for servers
 */
serversRouter.get("/search", async (req: Request, res: Response) => {
	try {
		const query = req.query.q as string
		if (!query || query.trim().length === 0) {
			return res.status(400).json({ error: "Search query is required" })
		}

		const apiKey = await getApiKey()
		if (!apiKey) {
			return res.status(401).json({ error: "API key not configured" })
		}

		const results = await searchServers(query, apiKey)
		res.json({ servers: results })
	} catch (error) {
		const message = error instanceof Error ? error.message : "Search failed"
		res.status(500).json({ error: message })
	}
})

/**
 * GET /api/servers/:qualifiedName
 * Get details for a specific server from the registry
 */
serversRouter.get("/:qualifiedName", async (req: Request, res: Response) => {
	try {
		const qualifiedName = req.params.qualifiedName as string
		if (!qualifiedName) {
			return res.status(400).json({ error: "Server name is required" })
		}

		const { server, connection } = await resolveServer(qualifiedName)
		res.json({
			server: {
				qualifiedName: server.qualifiedName,
				displayName: server.displayName,
				description: server.description,
				iconUrl: server.iconUrl,
				security: server.security,
			},
			connection: {
				type: connection.type,
				// Include config schema if available
				configSchema: "configSchema" in connection ? connection.configSchema : undefined,
			},
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to resolve server"
		res.status(500).json({ error: message })
	}
})
