import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamp("email_verified_at", { useTz: true });
  });

  // Migration öncesindeki kullanıcıların girişini engellememek için onları doğrulanmış kabul et.
  await knex("users").update({ email_verified_at: knex.fn.now() });

  await knex.schema.createTable("email_verification_tokens", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("email", 255).notNullable();
    table.string("token_hash", 64).notNullable().unique();
    table.string("purpose", 30).notNullable();
    table.timestamp("expires_at", { useTz: true }).notNullable();
    table.timestamp("used_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(["user_id", "purpose"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("email_verification_tokens");
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("email_verified_at");
  });
}
