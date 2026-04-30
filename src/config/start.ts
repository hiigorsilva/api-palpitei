import type { FastifyInstance } from "fastify";
import { env } from "../shared/utils/env";

export const registerServerStart = async (app: FastifyInstance) => {
	try {
		await app.listen({ port: env.PORT, host: env.HOST });
		console.info(`✅ Server is running on port ${env.PORT}`);
		console.info(`✅ Server listening at http://localhost:${env.PORT}`);
		console.info(
			`✅ API Reference available at http://${env.HOST}:${env.PORT}/api/docs`,
		);
	} catch (_error) {
		// app.log.error("SERVER_START_ERROR", error);
		process.exit(1);
	}
};
