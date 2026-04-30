import type { RouteShorthandOptions } from "fastify";
import z from "zod";

export const healthSchema: RouteShorthandOptions = {
	schema: {
		summary: "Health Check Route",
		description: "Endpoint to check the health status of the application",
		consumes: ["application/json"],
		tags: ["Health"],
		response: {
			200: z.object({
				data: z.object({
					status: z.string(),
				}),
			}),
			400: z.object({
				data: z.object({
					error: z.string(),
				}),
			}),
		},
	},
};
