import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../shared/utils/env";
import { schema } from "./schemas";

export const db = drizzle(env.DATABASE_URL, {
	schema: {
		...schema,
	},
});
