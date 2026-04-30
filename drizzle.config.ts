import { defineConfig } from "drizzle-kit";
import { env } from "./src/shared/utils/env";

export default defineConfig({
	dialect: "postgresql",
	schema: "src/db/schemas",
	out: "src/db/migrations",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
