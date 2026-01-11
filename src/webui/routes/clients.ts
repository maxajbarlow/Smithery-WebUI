import { Router, type Request, type Response } from "express"
import {
	CLIENT_CONFIGURATIONS,
	VALID_CLIENTS,
	getClientConfiguration,
	type ValidClient,
} from "../../config/clients.js"
import { readConfig, writeConfig } from "../../lib/client-config-io.js"
import { deleteConfig, saveConfig } from "../../lib/keychain.js"
import { resolveServer } from "../../lib/registry.js"
import type { ServerConfig } from "../../types/registry.js"
import { getServerName } from "../../utils/install/helpers.js"
import { formatServerConfig } from "../../utils/install/server-config.js"

export const clientsRouter = Router()

/**
 * GET /api/clients
 * List all available clients with their configuration
 */
clientsRouter.get("/", (_req: Request, res: Response) => {
	const clients = VALID_CLIENTS.map((name) => {
		const config = CLIENT_CONFIGURATIONS[name]
		return {
			name,
			label: config.label,
			installType: config.installType,
			supportedTransports: config.supportedTransports,
			path: config.path,
			supportsOAuth: config.supportsOAuth,
		}
	})
	res.json({ clients })
})

/**
 * GET /api/clients/:client
 * Get details for a specific client
 */
clientsRouter.get("/:client", (req: Request, res: Response) => {
	try {
		const client = req.params.client as string
		const config = getClientConfiguration(client)
		res.json({
			name: client,
			label: config.label,
			installType: config.installType,
			supportedTransports: config.supportedTransports,
			path: config.path,
			supportsOAuth: config.supportsOAuth,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : "Client not found"
		res.status(404).json({ error: message })
	}
})

/**
 * GET /api/clients/:client/servers
 * List installed servers for a client
 */
clientsRouter.get("/:client/servers", (req: Request, res: Response) => {
	try {
		const client = req.params.client as string

		// Validate client
		const clientConfig = getClientConfiguration(client)

		// Command-based clients don't support listing
		if (clientConfig.installType === "command") {
			return res.json({
				servers: [],
				message: `Listing servers is not supported for ${clientConfig.label}`,
			})
		}

		const config = readConfig(client)
		const servers = Object.entries(config.mcpServers).map(([name, serverConfig]) => ({
			name,
			...serverConfig,
		}))

		res.json({ servers })
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to read config"
		res.status(500).json({ error: message })
	}
})

/**
 * POST /api/clients/:client/servers
 * Install a server for a client
 * Body: { qualifiedName: string, config?: object }
 */
clientsRouter.post("/:client/servers", async (req: Request, res: Response) => {
	try {
		const client = req.params.client as string
		const { qualifiedName, config: configValues = {} } = req.body as {
			qualifiedName: string
			config?: ServerConfig
		}

		if (!qualifiedName) {
			return res.status(400).json({ error: "qualifiedName is required" })
		}

		// Get client configuration
		const clientConfig = getClientConfiguration(client)

		// Resolve server from registry
		const { server, connection } = await resolveServer(qualifiedName)

		// Check for required runtimes (skip in web context)
		// await ensureUVInstalled(connection)
		// await ensureBunInstalled(connection)

		// Format server config for client
		const serverConfig = formatServerConfig(qualifiedName, client, server)
		const serverName = getServerName(qualifiedName)

		// Save config to keychain if provided
		if (Object.keys(configValues).length > 0) {
			await saveConfig(qualifiedName, configValues)
		}

		// Install based on client type
		if (clientConfig.installType === "command") {
			// Command-based clients need special handling
			// For now, return instructions
			return res.json({
				success: false,
				message: `Please use the CLI to install servers for ${clientConfig.label}`,
				command: `smithery install ${qualifiedName} --client ${client}`,
			})
		}

		// For file-based clients, read config and merge
		const existingConfig = readConfig(client)
		existingConfig.mcpServers[serverName] = serverConfig
		writeConfig(existingConfig, client)

		res.json({
			success: true,
			message: `${qualifiedName} installed for ${clientConfig.label}`,
			serverName,
			restartRequired: true,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : "Installation failed"
		res.status(500).json({ error: message })
	}
})

/**
 * DELETE /api/clients/:client/servers/:serverName
 * Uninstall a server from a client
 */
clientsRouter.delete("/:client/servers/:serverName", async (req: Request, res: Response) => {
	try {
		const client = req.params.client as string
		const serverName = req.params.serverName as string

		// Get client configuration
		const clientConfig = getClientConfiguration(client)

		// Command-based clients don't support uninstall via API
		if (clientConfig.installType === "command") {
			return res.json({
				success: false,
				message: `Please use the CLI to uninstall servers from ${clientConfig.label}`,
			})
		}

		// Read current config
		const config = readConfig(client)

		// Check if server exists
		if (!config.mcpServers[serverName]) {
			return res.status(404).json({
				error: `${serverName} is not installed for ${clientConfig.label}`,
			})
		}

		// Remove server from config
		delete config.mcpServers[serverName]
		writeConfig(config, client)

		// Remove from keychain
		await deleteConfig(serverName)

		res.json({
			success: true,
			message: `${serverName} uninstalled from ${clientConfig.label}`,
			restartRequired: true,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : "Uninstall failed"
		res.status(500).json({ error: message })
	}
})
