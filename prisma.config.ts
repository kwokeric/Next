import { defineConfig, env } from "prisma/config";

// Prisma's config loader intentionally skips .env loading, so load it
// ourselves (Node 20.6+ built-in — no dotenv dependency needed).
try {
  process.loadEnvFile();
} catch {
  // no .env file yet — fine for commands that don't need DATABASE_URL
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
