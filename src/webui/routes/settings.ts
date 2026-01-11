import { Router, type Request, type Response } from "express"
import { validateApiKey } from "../../lib/registry.js"
import {
	clearApiKey,
	getApiKey,
	initializeSettings,
	setApiKey,
} from "../../utils/smithery-settings.js"

export const settingsRouter = Router()

/**
 * GET /api/settings
 * Get current settings status
 */
settingsRouter.get("/", async (_req: Request, res: Response) => {
	try {
		await initializeSettings()
		const apiKey = await getApiKey()

		res.json({
			hasApiKey: !!apiKey,
			// Mask the API key for display
			apiKeyPreview: apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : null,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to get settings"
		res.status(500).json({ error: message })
	}
})

/**
 * POST /api/settings/apikey
 * Set the API key
 * Body: { apiKey: string }
 */
settingsRouter.post("/apikey", async (req: Request, res: Response) => {
	try {
		const { apiKey } = req.body as { apiKey: string }

		if (!apiKey || apiKey.trim().length === 0) {
			return res.status(400).json({ error: "API key is required" })
		}

		// Validate the API key
		await validateApiKey(apiKey.trim())

		// Save the API key
		const result = await setApiKey(apiKey.trim())

		if (result.success) {
			res.json({
				success: true,
				message: "API key saved successfully",
			})
		} else {
			res.status(500).json({
				error: result.error || "Failed to save API key",
			})
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to set API key"
		res.status(400).json({ error: message })
	}
})

/**
 * DELETE /api/settings/apikey
 * Clear the API key
 */
settingsRouter.delete("/apikey", async (_req: Request, res: Response) => {
	try {
		const result = await clearApiKey()

		if (result.success) {
			res.json({
				success: true,
				message: "API key cleared",
			})
		} else {
			res.status(500).json({
				error: result.error || "Failed to clear API key",
			})
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to clear API key"
		res.status(500).json({ error: message })
	}
})
