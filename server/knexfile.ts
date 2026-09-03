import type { Knex } from "knex";
import "dotenv/config";

const shared: Knex.Config = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: { directory: "./database/migrations", extension: "ts" },
};

const config: Record<string, Knex.Config> = {
  development: shared,
  test: shared,
  production: {
    ...shared,
    pool: { min: 2, max: 10 },
  },
};

export default config;
