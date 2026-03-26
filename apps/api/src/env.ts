import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().min(16),
  JWT_ISSUER: z.string().default("mini-saas-api"),
});

export const env = envSchema.parse(process.env);