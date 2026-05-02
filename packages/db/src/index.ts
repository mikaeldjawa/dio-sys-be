import { env } from "@dio-sys-be/env/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as relation from "./relations";
import * as schema from "./schema";

export function createDb() {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, {
    schema: {
      ...schema,
      ...relation,
    },
  });
}

export const db = createDb();
