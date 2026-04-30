import type { FastifyInstance } from "fastify";
import { healthRoute } from "../modules/healths/routes/health.route";

export const registerRoutes = (app: FastifyInstance) => {
	app.register(healthRoute, { prefix: "/api" });
};
