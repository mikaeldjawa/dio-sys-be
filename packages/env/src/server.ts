import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("24h"),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
