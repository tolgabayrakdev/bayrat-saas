import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL gereklidir"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET en az 32 karakter olmalıdır"),
  JWT_EXPIRES_IN: z.string().default("1d"),
});

export const env = envSchema.parse(process.env);
