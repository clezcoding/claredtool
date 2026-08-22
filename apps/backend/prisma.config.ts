import "dotenv/config";
import { defineConfig, env } from "prisma/config";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://clared_app:clared_app_dev@127.0.0.1:5432/clared";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
