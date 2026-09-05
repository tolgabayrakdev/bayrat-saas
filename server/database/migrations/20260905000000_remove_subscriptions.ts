import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("subscriptions");
  await knex.schema.dropTableIfExists("plan_options");
  await knex.schema.dropTableIfExists("plans");
}

export async function down(): Promise<void> {
  // Abonelik sistemi üründen kalıcı olarak kaldırıldı.
}
