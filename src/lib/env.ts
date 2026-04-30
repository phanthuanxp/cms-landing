import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().min(1).default("cms_admin_session"),
  SESSION_SECRET: z.string().min(32),
  APP_ENV: z.string().default("development"),
  DEFAULT_SITE_DOMAIN: z.string().default("localhost:3000"),
  CONTENT_API_KEY: z.string().optional()
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET ?? process.env.AUTH_SECRET,
  APP_ENV: process.env.APP_ENV,
  DEFAULT_SITE_DOMAIN: process.env.DEFAULT_SITE_DOMAIN,
  CONTENT_API_KEY: process.env.CONTENT_API_KEY
});
