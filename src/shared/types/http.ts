declare module "fastify" {
	interface FastifyRequest {
		userId: string | null;
	}
}

export type HttpResponse = {
	data?: Record<string, any>;
};
