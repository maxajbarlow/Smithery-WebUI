import cors from "cors"
import express, { type Request, type Response, type NextFunction } from "express"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { clientsRouter } from "./routes/clients.js"
import { serversRouter } from "./routes/servers.js"
import { settingsRouter } from "./routes/settings.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// In bundled mode, we're in dist/index.js, so webui is at dist/webui
// In dev mode, we're in src/webui/server.ts, so webui is at ../../dist/webui
const getWebUIPath = () => {
	// Check if running from dist (bundled) or src (dev)
	if (__dirname.includes("dist")) {
		return path.join(__dirname, "webui")
	}
	return path.join(__dirname, "../../dist/webui")
}

export interface WebUIOptions {
	port: number
	open?: boolean
}

export function createApp() {
	const app = express()

	// Middleware
	app.use(cors())
	app.use(express.json())

	// API Routes
	app.use("/api/servers", serversRouter)
	app.use("/api/clients", clientsRouter)
	app.use("/api/settings", settingsRouter)

	// Serve static frontend files
	const frontendPath = getWebUIPath()
	app.use(express.static(frontendPath))

	// SPA fallback - serve index.html for all non-API routes
	app.use((req: Request, res: Response, next: NextFunction) => {
		if (!req.path.startsWith("/api") && req.method === "GET") {
			res.sendFile(path.join(frontendPath, "index.html"), (err) => {
				if (err) next(err)
			})
		} else {
			next()
		}
	})

	// Error handler
	app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
		console.error("Server error:", err)
		res.status(500).json({
			error: err.message || "Internal server error",
		})
	})

	return app
}

export async function startWebUI(options: WebUIOptions): Promise<void> {
	const app = createApp()

	return new Promise((resolve) => {
		const server = app.listen(options.port, () => {
			const url = `http://localhost:${options.port}`
			console.log(`\n  Smithery WebUI running at: ${url}\n`)

			if (options.open !== false) {
				// Open browser
				import("../lib/browser.js").then(({ openBrowser }) => {
					openBrowser(url)
				})
			}

			// Handle graceful shutdown
			const shutdown = () => {
				console.log("\nShutting down WebUI...")
				server.close(() => {
					resolve()
					process.exit(0)
				})
			}

			process.on("SIGINT", shutdown)
			process.on("SIGTERM", shutdown)
		})
	})
}
