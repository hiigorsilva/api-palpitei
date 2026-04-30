import fastifySwagger from "@fastify/swagger";
import scalarFastifyApiReference from "@scalar/fastify-api-reference";
import type { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { env } from "../../shared/utils/env";

export const registerSwagger = (app: FastifyInstance) => {
	app.register(fastifySwagger, {
		openapi: {
			info: {
				title: "SaaS Finance API",
				description: "API documentation for SaaS Finance application",
				version: "1.0.0",
			},
			servers: [
				{
					url: `http://localhost:${env.PORT}`,
				},
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
			},
		},
		transform: jsonSchemaTransform,
	});

	app.register(scalarFastifyApiReference, {
		routePrefix: "/api/docs",
		configuration: {
			theme: "moon",
		},
	});
};
