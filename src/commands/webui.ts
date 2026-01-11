import chalk from "chalk"
import { startWebUI } from "../webui/server.js"

export interface WebUICommandOptions {
	port?: string
	open?: boolean
}

export async function webui(options: WebUICommandOptions): Promise<void> {
	const port = options.port ? Number.parseInt(options.port, 10) : 3847

	if (Number.isNaN(port) || port < 1 || port > 65535) {
		console.error(chalk.red("Invalid port number"))
		process.exit(1)
	}

	console.log(chalk.cyan.bold("\n  Smithery WebUI"))
	console.log(chalk.gray("  Starting server...\n"))

	try {
		await startWebUI({
			port,
			open: options.open !== false,
		})
	} catch (error) {
		console.error(chalk.red("Failed to start WebUI:"), error)
		process.exit(1)
	}
}
